import { useState, useEffect } from 'react';
import { getUserProfile } from '../../api/userService';

const AccountSettings = () => {
    const [user, setUser] = useState({ name: '', email: '', grade: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getUserProfile();
            setUser(data);
        } catch (error) {
            console.error(error);
            // Mock data structure matching spec
            setUser({ email: 'user@example.com', name: 'User Name', grade: 'MEMBER' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h3 className="mypage-section-title">회원 정보</h3>
            <div className="account-info-card" style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#666', fontSize: '0.9rem' }}>이름</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{user.name}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#666', fontSize: '0.9rem' }}>이메일</label>
                    <div style={{ fontSize: '1.1rem' }}>{user.email}</div>
                </div>
                <div>
                    <label style={{ color: '#666', fontSize: '0.9rem' }}>회원 등급</label>
                    <div style={{ fontSize: '1.1rem', color: '#007bff' }}>{user.grade}</div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
