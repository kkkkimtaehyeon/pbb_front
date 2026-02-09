import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAdminProducts } from '../../api/adminService';
import './AdminProductList.css';

const AdminProductList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const selectedType = searchParams.get('productType') || '';

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getAdminProducts(page, 10, selectedType);
            setProducts(data.products.content);
            setTotalPages(data.products.totalPages);
            if (data.productTypes) {
                setProductTypes(data.productTypes);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, selectedType]);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleTypeClick = (type) => {
        const newParams = new URLSearchParams(searchParams);
        if (type) {
            newParams.set('productType', type);
        } else {
            newParams.delete('productType');
        }
        setPage(0); // Reset into first page
        setSearchParams(newParams);
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>상품 관리</h2>
                <div className="header-actions">
                    <div className="type-filters">
                        <button
                            className={`filter-btn ${selectedType === '' ? 'active' : ''}`}
                            onClick={() => handleTypeClick('')}
                        >
                            전체
                        </button>
                        {productTypes.map(type => (
                            <button
                                key={type.status}
                                className={`filter-btn ${selectedType === type.status ? 'active' : ''}`}
                                onClick={() => handleTypeClick(type.status)}
                            >
                                {type.displayName}
                            </button>
                        ))}
                    </div>
                    <button className="primary-btn" onClick={() => navigate('/admin/products/new')}>상품 등록</button>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>상품명</th>
                        <th>카테고리</th>
                        <th>유형</th>
                        <th>판매가</th>
                        <th>재고</th>
                        <th>상태</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>
                                <div className="product-info-cell">
                                    <div className="product-thumb">
                                        {product.imageUrl && <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <span>
                                        {product.name.length > 15
                                            ? product.name.slice(0, 15) + '...'
                                            : product.name}
                                    </span>
                                </div>
                            </td>
                            <td>{product.category}</td>
                            <td>{product.type}</td>
                            <td>{product.priceSales?.toLocaleString()}원</td>
                            <td>
                                <span className={product.stock < 5 ? 'text-danger' : ''}>
                                    {product.stock}
                                </span>
                            </td>
                            <td>
                                <span className={`status-badge ${product.status?.status.toLowerCase()}`}>
                                    {product.status.displayName}
                                </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>수정</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>&lt;</button>
                <span>{page + 1} / {totalPages || 1}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>&gt;</button>
            </div>
        </div>
    );
};

export default AdminProductList;
