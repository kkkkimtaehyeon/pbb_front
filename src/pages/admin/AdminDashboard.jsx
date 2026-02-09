import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    // Mock Data for Dashboard
    const stats = [
        { title: '오늘 주문', value: '142건', change: '+12%', color: '#3498db' },
        { title: '오늘 매출', value: '₩4,250,000', change: '+8%', color: '#2ecc71' },
        { title: '결제 실패', value: '3건', change: '-2%', color: '#e74c3c' },
        { title: '재고 부족 상품 (5개 이하)', value: '12개', change: '주의', color: '#f39c12' },
    ];

    const recentOrders = [
        { id: 'ORD-001', member: '김철수', amount: '54,000', status: 'PAID', time: '10:42 AM' },
        { id: 'ORD-002', member: '이영희', amount: '32,500', status: 'SHIPPING', time: '10:15 AM' },
        { id: 'ORD-003', member: '박민수', amount: '128,000', status: 'ORDERED', time: '09:50 AM' },
        { id: 'ORD-004', member: '홍길동', amount: '15,000', status: 'FAIL', time: '09:12 AM' },
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-stats">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card" style={{ borderTop: `4px solid ${stat.color}` }}>
                        <div className="stat-title">{stat.title}</div>
                        <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                        <div className="stat-change">{stat.change}</div>
                    </div>
                ))}
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <h4>최근 주문 현황</h4>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>주문번호</th>
                                <th>주문자</th>
                                <th>금액</th>
                                <th>상태</th>
                                <th>시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.member}</td>
                                    <td>{order.amount}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{order.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="section-card">
                    <h4>시스템 상태 / 에러 로그</h4>
                    <div className="log-list">
                        <div className="log-item error">
                            <span className="time">10:45 AM</span>
                            <span className="message">[Payment] 결제 타임아웃 발생 (User ID: 1024)</span>
                        </div>
                        <div className="log-item warning">
                            <span className="time">09:30 AM</span>
                            <span className="message">[Stock] '리액트 교과서' 재고 5개 미만</span>
                        </div>
                        <div className="log-item info">
                            <span className="time">08:00 AM</span>
                            <span className="message">배치 작업 완료 (Daily Settlement)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
