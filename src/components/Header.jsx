import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <header className="main-header">
            <div className="header-container">
                <Link to="/" className="logo">
                    PlzBuyBook
                </Link>

                <nav className="header-nav">
                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" className="nav-item">장바구니</Link>
                            <Link to="/mypage" className="nav-item">마이페이지</Link>
                            <button className="nav-btn logout-btn" onClick={handleLogout}>로그아웃</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="nav-item">회원가입</Link>
                            <Link to="/login" className="nav-btn login-btn">로그인</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
