import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
    const location = useLocation();

    const menuItems = [
        // { path: '/admin/dashboard', label: '대시보드' },
        { path: '/admin/orders', label: '주문/배송 관리' },
        { path: '/admin/products', label: '상품 관리' },
        // { path: '/admin/members', label: '회원 관리' },
        { path: '/admin/claims', label: '반품/취소 관리' },
        // { path: '/admin/payments', label: '결제/정산 관리' },
        // { path: '/admin/reviews', label: '리뷰/콘텐츠 관리' },
        // { path: '/admin/stats', label: '통계/리포트' },
        // { path: '/admin/system', label: '시스템 관리' },
    ];

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-logo">
                    <h2>BookStore Admin</h2>
                </div>
                <nav className="admin-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path} className={location.pathname.startsWith(item.path) ? 'active' : ''}>
                                <Link to={item.path}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="admin-content">
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
