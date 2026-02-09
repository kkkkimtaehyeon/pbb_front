import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders } from '../../api/adminService';
import './AdminOrderList.css';

const AdminOrderList = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [orderStatuses, setOrderStatuses] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAdminOrders(page, 10, filterStatus);
            setOrders(data.orders.content);
            setTotalPages(data.orders.totalPages);
            setOrderStatuses(data.orderStatuses);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="admin-page-container">
            <div className="page-header">
                <h2>주문 관리</h2>
                <div className="filters">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">전체 상태</option>
                        {orderStatuses.map(status => (
                            <option key={status.status} value={status.status}>
                                {status.displayName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>주문번호</th>
                        <th>주문상품</th>
                        <th>결제금액</th>
                        <th>주문일시</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.orderId}>
                            <td>{order.orderId}</td>
                            <td>{order.productSummary}</td>
                            <td>{order.amount?.toLocaleString()}원</td>
                            <td>{order.orderedAt}</td>
                            <td>
                                <button
                                    className="action-btn"
                                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                                >
                                    상세보기
                                </button>
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

export default AdminOrderList;
