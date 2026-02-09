import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCartItems, removeCartItems } from '../api/cartService';
import './CartPage.css';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await getCartItems();
            console.log('Cart Data:', data); // Inspect API response
            setCartItems(data.items || []); // Assume { items: [] } structure
        } catch (err) {
            setError('장바구니를 불러오지 못했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleDelete = async () => {
        // Filter out any null/undefined values just in case
        const validItems = selectedItems.filter(id => id != null);

        if (validItems.length === 0) {
            alert('삭제할 상품을 선택해주세요.');
            return;
        }

        try {
            await removeCartItems(validItems);
            alert('선택한 상품이 삭제되었습니다.');
            setSelectedItems([]);
            fetchCart(); // Refresh list
        } catch (err) {
            alert('삭제 실패');
            console.error(err);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = cartItems.map(item => item.cartItemId);
            setSelectedItems(allIds);
        } else {
            setSelectedItems([]);
        }
    };

    const handleOrder = async () => {
        if (selectedItems.length === 0) {
            alert('Please select items to order.');
            return;
        }

        const orderItems = cartItems
            .filter(item => selectedItems.includes(item.cartItemId))
            .map(item => ({
                productId: item.productId,
                price: item.price,
                quantity: item.quantity,
                productName: item.productName,
                productImageUrl: item.productImageUrl,
                productType: item.productType // Passing this too just in case
            }));

        // Direct navigation to OrderPage with selected items
        // No API call here anymore
        navigate('/order', { state: { items: orderItems } });
    };

    const totalPrice = cartItems
        .filter(item => selectedItems.includes(item.cartItemId))
        .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (loading) return <div className="loading">Loading Cart...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="cart-container">
            <h1>장바구니</h1>
            {cartItems.length === 0 ? (
                <p>장바구니가 비어있습니다.</p>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>상품명</th>
                                <th>가격</th>
                                <th>수량</th>
                                <th>총액</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.cartItemId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.cartItemId)}
                                            onChange={() => handleCheckboxChange(item.cartItemId)}
                                        />
                                    </td>
                                    <td>{item.productName}</td>
                                    <td>{item.price.toLocaleString()} 원</td>
                                    <td>{item.quantity}</td>
                                    <td>{(item.price * item.quantity).toLocaleString()} 원</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="cart-summary">
                        <h3>총액: {totalPrice.toLocaleString()} 원</h3>
                        <div className="cart-actions">
                            <button className="delete-btn" onClick={handleDelete}>선택 삭제</button>
                            <button className="checkout-btn" onClick={handleOrder}>선택 주문</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
