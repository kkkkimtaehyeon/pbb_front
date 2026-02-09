import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getAdminProduct, updateProduct, searchAuthors, searchPublishers } from '../../api/adminService';
import { getCategories } from '../../api/categoryService';
import './AdminProductCreate.css';

const AdminProductCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [categories, setCategories] = useState([]);

    // Type selection: 'type' matches backend Private ProductType
    const [type, setType] = useState('BOOK');

    // Common Fields
    const [name, setName] = useState('');
    const [priceSales, setPriceSales] = useState('');
    const [stock, setStock] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('SELLING');

    // Category Selection
    const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);
    const [categoryId, setCategoryId] = useState('');

    // Book Specific
    const [title, setTitle] = useState('');
    const [priceStandard, setPriceStandard] = useState('');
    const [isbn13, setIsbn13] = useState('');
    const [publishDate, setPublishDate] = useState('');
    const [summary, setSummary] = useState('');

    // Author Selection
    const [authors, setAuthors] = useState([]); // Selected authors [{id, name}]
    const [authorSearchName, setAuthorSearchName] = useState('');
    const [authorSearchResults, setAuthorSearchResults] = useState([]);

    // Publisher Selection
    const [publisher, setPublisher] = useState(null); // Selected publisher {id, name}
    const [publisherSearchName, setPublisherSearchName] = useState('');
    const [publisherSearchResults, setPublisherSearchResults] = useState([]);


    useEffect(() => {
        // Fetch categories for dropdown
        const fetchCats = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (e) {
                console.error("Failed to load categories");
            }
        };
        fetchCats();
    }, []);

    // Helper to find path to category by ID
    const findCategoryPath = (cats, targetId) => {
        for (const cat of cats) {
            if (cat.id === targetId) return [cat];
            if (cat.children) {
                const path = findCategoryPath(cat.children, targetId);
                if (path) return [cat, ...path];
            }
        }
        return null;
    };

    // Helper to find path to category by Name (fallback)
    const findCategoryPathByName = (cats, targetName) => {
        for (const cat of cats) {
            if (cat.name === targetName) return [cat];
            if (cat.children) {
                const path = findCategoryPathByName(cat.children, targetName);
                if (path) return [cat, ...path];
            }
        }
        return null;
    };

    useEffect(() => {
        if (isEditMode && categories.length > 0) {
            const fetchProduct = async () => {
                try {
                    const data = await getAdminProduct(id);
                    // Map response to state
                    setType(data.productType || 'BOOK');
                    setName(data.productName || '');
                    setPriceSales(data.priceSales || '');
                    setStock(data.stock || '');
                    setImageUrl(data.imageUrl || '');
                    setStatus(data.productStatus || 'SELLING');

                    // Set category path
                    if (data.categoryId) { // If backend returns categoryId (ideal)
                        const path = findCategoryPath(categories, data.categoryId);
                        if (path) {
                            setSelectedCategoryPath(path);
                            setCategoryId(data.categoryId);
                        }
                    } else if (data.categoryName) { // Fallback to name
                        const path = findCategoryPathByName(categories, data.categoryName);
                        if (path) {
                            setSelectedCategoryPath(path);
                            setCategoryId(path[path.length - 1].id);
                        }
                    }

                    // Book specific
                    setTitle(data.title || '');
                    setPriceStandard(data.priceStandard || '');
                    setIsbn13(data.isbn13 || '');
                    setPublishDate(data.publishDate || '');
                    setSummary(data.description || '');

                    // Allow backend to potentially send enriched author objects
                    // If backend sends simple IDs, we can't display names without fetching them. 
                    // Assuming for now user only cares about IDs *or* backend starts sending objects. 
                    // Given the request "search by name", we should probably try to load names.
                    // For now, if we only have IDs, we might display ID. But usually we want names.
                    // Let's assume the update API will return full details including names if we updated the getAdminProduct response structure.
                    // If not, we just show IDs in the chip.
                    if (data.authors) {
                        setAuthors(data.authors); // Expecting [{id, name}] or similar. 
                        // If it is just [1, 2], we wrap it:
                        if (data.authors.length > 0 && typeof data.authors[0] === 'number') {
                            setAuthors(data.authors.map(id => ({ id, name: `ID: ${id}` })));
                        }
                    } else if (data.authorIds) {
                        setAuthors(data.authorIds.map(id => ({ id, name: `ID: ${id}` })));
                    }

                    if (data.publisher) {
                        setPublisher(data.publisher);
                    } else if (data.publisherId) {
                        setPublisher({ id: data.publisherId, name: `ID: ${data.publisherId}` });
                    }

                } catch (error) {
                    console.error("Failed to fetch product", error);
                    alert("상품 정보를 불러오는데 실패했습니다.");
                }
            };
            fetchProduct();
        }
    }, [isEditMode, id, categories]);

    // Handle Category Selection
    const handleCategorySelect = (level, selectedId) => {
        const id = Number(selectedId);
        if (!id) {
            // If "Select" chosen, cut path at this level
            const newPath = selectedCategoryPath.slice(0, level);
            setSelectedCategoryPath(newPath);
            setCategoryId(newPath.length > 0 ? newPath[newPath.length - 1].id : '');
            return;
        }

        // Find the category object in the current level's options
        let currentOptions = categories;
        if (level > 0) {
            currentOptions = selectedCategoryPath[level - 1].children;
        }

        const selectedCat = currentOptions.find(c => c.id === id);

        // Update path: keep up to current level, add new selection
        const newPath = [...selectedCategoryPath.slice(0, level), selectedCat];
        setSelectedCategoryPath(newPath);
        setCategoryId(selectedCat.id);
    };

    // Author Search
    const handleAuthorSearch = async () => {
        if (!authorSearchName) return;
        try {
            const results = await searchAuthors(authorSearchName);
            setAuthorSearchResults(results); // Expecting [{id, name}, ...]
        } catch (e) {
            alert('저자 검색 실패');
        }
    };

    const addAuthor = (author) => {
        if (!authors.find(a => a.id === author.id)) {
            setAuthors([...authors, author]);
        }
        setAuthorSearchName('');
        setAuthorSearchResults([]);
    };

    const removeAuthor = (id) => {
        setAuthors(authors.filter(a => a.id !== id));
    };

    // Publisher Search
    const handlePublisherSearch = async () => {
        if (!publisherSearchName) return;
        try {
            const results = await searchPublishers(publisherSearchName);
            setPublisherSearchResults(results);
        } catch (e) {
            alert('출판사 검색 실패');
        }
    };

    const selectPublisher = (pub) => {
        setPublisher(pub);
        setPublisherSearchName('');
        setPublisherSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const commonData = {
                type,
                name,
                priceSales: Number(priceSales),
                stock: Number(stock),
                imageUrl,
                categoryId: Number(categoryId),
                status
            };

            let payload = { ...commonData };

            if (type === 'BOOK') {
                payload = {
                    ...payload,
                    title,
                    priceStandard: Number(priceStandard),
                    isbn13,
                    publishDate,
                    summary,
                    authorIds: authors.map(a => a.id),
                    publisherId: publisher ? publisher.id : null
                };
            }

            if (isEditMode) {
                await updateProduct(id, payload);
                alert('상품이 수정되었습니다.');
            } else {
                await createProduct(payload);
                alert('상품이 등록되었습니다.');
            }
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert(isEditMode ? '상품 수정 중 오류가 발생했습니다.' : '상품 등록 중 오류가 발생했습니다.');
        }
    };

    // Render Cascading Category Dropdowns
    const renderCategoryDropdowns = () => {
        const dropdowns = [];
        // Always show root level
        let currentOptions = categories;

        // Loop to render dropdowns for each level in path + 1 for next selection
        // We go up to selectedCategoryPath.length + 1, but bounded by whether last selection has children

        const levels = selectedCategoryPath.length + 1;

        for (let i = 0; i < levels; i++) {
            // Determine options for this level
            if (i > 0) {
                const parent = selectedCategoryPath[i - 1];
                if (!parent.children || parent.children.length === 0) break;
                currentOptions = parent.children;
            }

            const selectedValue = selectedCategoryPath[i] ? selectedCategoryPath[i].id : '';

            dropdowns.push(
                <select
                    key={i}
                    value={selectedValue}
                    onChange={(e) => handleCategorySelect(i, e.target.value)}
                    className="category-select"
                    style={{ marginRight: '10px', marginBottom: '5px' }}
                >
                    <option value="">{i === 0 ? '1차 카테고리 선택' : `${i + 1}차 카테고리 선택`}</option>
                    {currentOptions.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            );

            // If we haven't selected anything at this level, don't show next level
            if (!selectedCategoryPath[i]) break;
        }

        return <div className="category-container">{dropdowns}</div>;
    };

    return (
        <div className="admin-page-container">
            <h2>{isEditMode ? '상품 수정' : '상품 등록'}</h2>
            <form onSubmit={handleSubmit} className="product-form">

                <div className="form-section">
                    <h3>기본 정보</h3>
                    <div className="form-group">
                        <label>상품 타입</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="BOOK">도서 (Book)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>상품명 (표시용)</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>카테고리</label>
                        {renderCategoryDropdowns()}
                        {/* Hidden input to ensure required validation if needed, or check categoryId in simple check */}
                        {categoryId === '' && <span className="warning-text">카테고리를 선택해주세요</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>판매가</label>
                            <input type="number" value={priceSales} onChange={(e) => setPriceSales(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>재고수량</label>
                            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>이미지 URL</label>
                        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>판매 상태</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="SELLING">판매중 (SELLING)</option>
                            <option value="STOP_SELLING">판매중지 (STOP_SELLING)</option>
                            <option value="HIDDEN">숨김 (HIDDEN)</option>
                        </select>
                    </div>
                </div>

                {type === 'BOOK' && (
                    <div className="form-section">
                        <h3>도서 상세 정보</h3>
                        <div className="form-group">
                            <label>도서 제목</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>정가 (PriceStandard)</label>
                            <input type="number" value={priceStandard} onChange={(e) => setPriceStandard(e.target.value)} required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>ISBN13</label>
                                <input value={isbn13} onChange={(e) => setIsbn13(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>출판일</label>
                                <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} required />
                            </div>
                        </div>

                        {/* Author Selection */}
                        <div className="form-group">
                            <label>저자</label>
                            <div className="search-box">
                                <input
                                    placeholder="저자 이름 검색"
                                    value={authorSearchName}
                                    onChange={(e) => setAuthorSearchName(e.target.value)}
                                />
                                <button type="button" className="action-btn" onClick={handleAuthorSearch}>검색</button>
                            </div>
                            {authorSearchResults.length > 0 && (
                                <ul className="search-results">
                                    {authorSearchResults.map(a => (
                                        <li key={a.id} onClick={() => addAuthor(a)}>
                                            {a.name} ({a.id})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="selected-items">
                                {authors.map(a => (
                                    <div key={a.id} className="chip">
                                        {a.name}
                                        <span className="remove-chip" onClick={() => removeAuthor(a.id)}>x</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Publisher Selection */}
                        <div className="form-group">
                            <label>출판사</label>
                            <div className="search-box">
                                <input
                                    placeholder="출판사 이름 검색"
                                    value={publisherSearchName}
                                    onChange={(e) => setPublisherSearchName(e.target.value)}
                                />
                                <button type="button" className="action-btn" onClick={handlePublisherSearch}>검색</button>
                            </div>
                            {publisherSearchResults.length > 0 && (
                                <ul className="search-results">
                                    {publisherSearchResults.map(p => (
                                        <li key={p.id} onClick={() => selectPublisher(p)}>
                                            {p.name} ({p.id})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="selected-items">
                                {publisher && (
                                    <div className="chip">
                                        {publisher.name}
                                        <span className="remove-chip" onClick={() => setPublisher(null)}>x</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>요약/설명</label>
                            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} />
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    <button type="submit" className="submit-btn primary-btn">{isEditMode ? '수정하기' : '등록하기'}</button>
                    <button type="button" className="cancel-btn" onClick={() => navigate('/admin/products')}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default AdminProductCreate;
