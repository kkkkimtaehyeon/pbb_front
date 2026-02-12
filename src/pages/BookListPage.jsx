import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getBookList } from '../api/bookService';
import { getCategories } from '../api/categoryService';
import { addToCart } from '../api/cartService';
import './BookListPage.css';

const BookListPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryId = searchParams.get('categoryId');

    // Reset page to 0 when category changes (we should handle this in useEffect or a separate effect)

    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Reset page when category changes
    useEffect(() => {
        setPage(0);
    }, [categoryId]);

    useEffect(() => {
        const fetchBooksAndCategories = async () => {
            try {
                setLoading(true);
                // Fetch categories only once or if needed? Usually categories are static for the session, 
                // but let's keep it simple and fetch them in parallel for now, or move out?
                // Actually `getBookList` now needs `categoryId`.

                // We might want to separate category fetching if it's constant, but existing code fetches both.
                // Let's keep fetching both or check?
                // The existing code re-fetches categories every time page changes... that's inefficient but let's stick to the pattern for now, 
                // just adding the param.

                const [bookData, categoryData] = await Promise.all([
                    getBookList(page, 10, [], categoryId),
                    getCategories()
                ]);

                setBooks(bookData.content);
                setTotalPages(bookData.totalPages);
                setCategories(categoryData);
            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooksAndCategories();
    }, [page, categoryId]);

    const handlePrevPage = () => {
        if (page > 0) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(page + 1);
    };

    const handleAddToCart = async (book) => {
        try {
            await addToCart([{ productId: book.id, quantity: 1 }]);
            if (window.confirm('장바구니에 상품이 추가되었습니다. 장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        } catch (err) {
            alert('장바구니에 상품을 추가하지 못했습니다.');
            console.error(err);
        }
    };

    const handleBuyNow = async (book) => {
        try {
            const salePrice = book.priceSales || book.price || 0;
            navigate('/order', {
                state: {
                    items: [{
                        productId: book.id,
                        price: salePrice,
                        quantity: 1,
                        productName: book.title, // Adding name for display
                        productImageUrl: book.imageUrl // Adding image for display
                    }]
                }
            });
        } catch (err) {
            alert('Failed to process buy now.');
            console.error(err);
        }
    };

    const handleCategoryClick = (id) => {
        setSearchParams({ categoryId: id });
        setPage(0); // Reset page manually just in case, though the effect does it too
    };

    const renderCategories = (cats, depth = 0) => {
        return (
            <ul className={`category-list depth-${depth}`}>
                {cats.map((cat) => (
                    <li key={cat.id}>
                        <span
                            onClick={() => handleCategoryClick(cat.id)}
                            style={{ cursor: 'pointer', fontWeight: categoryId == cat.id ? 'bold' : 'normal' }}
                        >
                            {cat.name}
                        </span>
                        {cat.children && cat.children.length > 0 && renderCategories(cat.children, depth + 1)}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) return <div className="loading-state">Loading best sellers...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div className="aladin-container">

            <div className="content-wrapper">
                <aside className="sidebar">
                    <h3>Categories</h3>
                    {renderCategories(categories)}
                </aside>

                <main className="book-list-scetion">
                    {/* <div className="date-display">
                        <select defaultValue="2026">
                            <option>2026</option>
                        </select>
                        <select defaultValue="1">
                            <option>January</option>
                        </select>
                        <select defaultValue="4">
                            <option>Week 4</option>
                        </select>
                        <span className="date-desc">Best sellers for the past week.</span>
                    </div> */}

                    <div className="book-list">
                        {books.map((book, index) => {
                            // Calculating fields if not strictly available
                            const rank = page * 10 + index + 1;
                            const salePrice = book.priceSales || book.price || 0;
                            const stdPrice = book.priceStandard; // Mock original price if missing
                            const discount = stdPrice > salePrice
                                ? Math.round(((stdPrice - salePrice) / stdPrice) * 100)
                                : 0;
                            const points = Math.floor(salePrice * 0.05); // Mock 5% points

                            return (
                                <div key={book.id} className="book-item">
                                    <div className="book-rank-col">
                                        <div className="rank-checkbox">
                                            <span className="rank-num">{rank}.</span>
                                        </div>
                                    </div>

                                    <div className="book-cover-col">
                                        <Link to={`/books/${book.id}`}>
                                            <img
                                                src={book.imageUrl || 'https://via.placeholder.com/150'}
                                                alt={book.title}
                                                className="book-cover"
                                            />
                                        </Link>
                                        <div className="preview-btn">Preview</div>
                                    </div>

                                    <div className="book-info-col">
                                        <div className="book-title-row">
                                            <Link to={`/books/${book.id}`} className="book-title">
                                                {book.title}
                                            </Link>
                                            <span className="book-tag">[{book.categoryName || 'Domestic'}]</span>
                                        </div>
                                        <div className="book-meta">
                                            {book.authors} | {book.publisher} | {book.publishDate || '2025-01'}
                                        </div>
                                        <div className="book-price-row">
                                            <span className="std-price">{Math.floor(stdPrice).toLocaleString()} 원</span>
                                            <span className="arrow">→</span>
                                            <span className="sale-price">{salePrice.toLocaleString()} 원</span>
                                            <span className="discount">({discount}% off)</span>
                                            <span className="points">적립 {points}P</span>
                                        </div>
                                        <div className="book-rating">
                                            <span className="star">★</span> 9.5 (130)
                                        </div>
                                        {book.summary && (
                                            <div className="book-summary-preview">
                                                {book.summary.length > 100 ? book.summary.substring(0, 100) + '...' : book.summary}
                                            </div>
                                        )}
                                    </div>

                                    <div className="book-action-col">
                                        <button className="btn-primary" onClick={() => handleAddToCart(book)}>장바구니 담기</button>
                                        <button className="btn-secondar" onClick={() => handleBuyNow(book)}>바로 구매</button>
                                        {/* <button className="btn-tertiary">위시리스트 담기</button> */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="pagination">
                        <button onClick={handlePrevPage} disabled={page === 0}>&lt;</button>

                        {Array.from({ length: 5 }, (_, i) => {
                            const startPage = Math.floor(page / 5) * 5;
                            const p = startPage + i;
                            if (p >= totalPages) return null;
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={page === p ? 'active' : ''}
                                >
                                    {p + 1}
                                </button>
                            );
                        })}

                        <button onClick={handleNextPage} disabled={page >= totalPages - 1}>&gt;</button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BookListPage;
