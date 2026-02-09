import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authService';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginSuccess } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            loginSuccess();
            navigate('/');
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <div className="login-container">
            <h1>로그인</h1>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" className="login-submit-btn">로그인</button>
            </form>

            <div className="login-footer">
                <Link to="/signup" className="signup-link">회원가입</Link>
            </div>
        </div>
    );
};

export default LoginPage;
