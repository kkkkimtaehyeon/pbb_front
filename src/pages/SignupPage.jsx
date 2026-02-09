import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api/authService';
import './LoginPage.css'; // Re-use Login styles for consistency

const SignupPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup({ name, email, password });
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            navigate('/login');
        } catch (err) {
            setError(err.message || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="login-container">
            <h1>회원가입</h1>

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
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

                <button type="submit" className="login-submit-btn">회원가입</button>
            </form>
        </div>
    );
};

export default SignupPage;
