import { useState } from 'react';
import AccountSettings from '../components/mypage/AccountSettings';
import OrderHistory from '../components/mypage/OrderHistory';
import Wishlist from '../components/mypage/Wishlist';
import AddressList from '../components/mypage/AddressList';
import './MyPage.css';

const MyPage = () => {
    const [activeTab, setActiveTab] = useState('orders');

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return <AccountSettings />;
            case 'orders':
                return <OrderHistory />;
            case 'wishlist':
                return <Wishlist />;
            case 'addresses':
                return <AddressList />;
            default:
                return <OrderHistory />;
        }
    };

    return (
        <div className="mypage-container">
            <aside className="mypage-sidebar">
                <h2>마이페이지</h2>
                <ul>
                    <li
                        className={activeTab === 'account' ? 'active' : ''}
                        onClick={() => setActiveTab('account')}
                    >
                        회원 정보
                    </li>
                    <li
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        주문 내역
                    </li>
                    {/* <li
                        className={activeTab === 'wishlist' ? 'active' : ''}
                        onClick={() => setActiveTab('wishlist')}
                    >
                        위시리스트
                    </li> */}
                    <li
                        className={activeTab === 'addresses' ? 'active' : ''}
                        onClick={() => setActiveTab('addresses')}
                    >
                        배송지 관리
                    </li>
                </ul>
            </aside>
            <main className="mypage-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default MyPage;
