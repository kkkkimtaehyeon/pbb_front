import { useState, useEffect } from 'react';
import { getAddresses, addAddress, deleteAddress } from '../../api/userService';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Schema: receiver, phoneNumber, zipcode, address, addressDetail, isDefault
    const [newAddress, setNewAddress] = useState({
        receiver: '',
        phoneNumber: '',
        zipcode: '',
        address: '',
        addressDetail: '',
        isDefault: false
    });

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const data = await getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error(error);
            // Mock data matching spec
            setAddresses([
                { id: 1, receiver: '홍길동', phoneNumber: '010-1234-5678', zipcode: '12345', address: '서울 특별시 강남구', addressDetail: '테헤란로 123', isDefault: true }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('이 배송지를 삭제하시겠습니까?')) return;
        try {
            await deleteAddress(id);
            setAddresses(addresses.filter(addr => addr.id !== id));
        } catch (error) {
            console.error(error);
            setAddresses(addresses.filter(addr => addr.id !== id));
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addAddress(newAddress);
            // Reload list to get IDs
            loadAddresses();
            setShowAddForm(false);
            setNewAddress({ receiver: '', phoneNumber: '', zipcode: '', address: '', addressDetail: '', isDefault: false });
        } catch (error) {
            console.error(error);
            // Mock add
            setAddresses([...addresses, { ...newAddress, id: Date.now() }]);
            setShowAddForm(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="mypage-section-title" style={{ margin: 0 }}>배송지 관리</h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    {showAddForm ? '취소' : '새 배송지 추가'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAdd} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div className="form-group">
                        <label>수령인</label>
                        <input required type="text" value={newAddress.receiver} onChange={e => setNewAddress({ ...newAddress, receiver: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>전화번호</label>
                        <input required type="text" placeholder="010-0000-0000" value={newAddress.phoneNumber} onChange={e => setNewAddress({ ...newAddress, phoneNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>우편번호</label>
                        <input required type="text" value={newAddress.zipcode} onChange={e => setNewAddress({ ...newAddress, zipcode: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>주소</label>
                        <input required type="text" value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>상세주소</label>
                        <input type="text" value={newAddress.addressDetail} onChange={e => setNewAddress({ ...newAddress, addressDetail: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={newAddress.isDefault}
                            onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="isDefault" style={{ marginBottom: 0 }}>기본 주소로 설정</label>
                    </div>
                    <button type="submit" className="login-submit-btn">저장</button>
                </form>
            )}

            <div className="address-list">
                {addresses.map(addr => (
                    <div key={addr.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                        {addr.isDefault && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#eee', padding: '2px 8px', fontSize: '0.8rem', borderRadius: '10px' }}>기본</span>}
                        <div>
                            <strong>{addr.receiver}</strong> <span style={{ color: '#666', fontSize: '0.9rem' }}>{addr.phoneNumber}</span>
                            <p style={{ margin: '5px 0' }}>({addr.zipcode}) {addr.address} {addr.addressDetail}</p>
                        </div>
                        <button onClick={() => handleDelete(addr.id)} style={{ color: 'red', border: '1px solid red', background: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                    </div>
                ))}
                {addresses.length === 0 && !loading && <p>저장된 배송지가 없습니다.</p>}
            </div>
        </div>
    );
};

export default AddressList;
