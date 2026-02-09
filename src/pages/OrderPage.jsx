import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { requestPayment } from '../api/paymentService';
import { getDefaultDeliveryAddress, getDeliveryAddresses } from '../api/deliveryService';
import './OrderPage.css';

const OrderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // State now contains items skipped from Cart
    const { items } = location.state || { items: [] };

    // Calculate total amount from items (since we don't have orderId/amount from backend yet)
    // Assuming backend will re-validate, but we need it for display
    const initialPrice = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = 0;
    const discount = 0;
    const finalPrice = initialPrice + shippingFee - discount;

    // Delivery Address State
    const [deliveryAddress, setDeliveryAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressList, setAddressList] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    // Initial fetch of default address
    useState(() => {
        async function fetchDefaultAddress() {
            try {
                const data = await getDefaultDeliveryAddress();
                const addr = Array.isArray(data) ? data[0] : data;
                setDeliveryAddress(addr);
                if (addr) setSelectedAddressId(addr.id);
            } catch (error) {
                console.error("Failed to fetch default address", error);
            }
        }
        fetchDefaultAddress();
    }, []);

    const handleOpenAddressModal = async () => {
        setIsAddressModalOpen(true);
        try {
            const list = await getDeliveryAddresses();
            setAddressList(Array.isArray(list) ? list : []);
            if (deliveryAddress) {
                setSelectedAddressId(deliveryAddress.id);
            }
        } catch (error) {
            console.error("Failed to load address list", error);
            alert("배송지 목록을 불러오지 못했습니다.");
        }
    };

    const handleApplyAddress = () => {
        const selected = addressList.find(addr => addr.id === selectedAddressId);
        if (selected) {
            setDeliveryAddress(selected);
        }
        setIsAddressModalOpen(false);
    };

    const handlePayment = async () => {
        if (!deliveryAddress) {
            alert("배송지를 선택해주세요.");
            return;
        }

        try {
            // Request payment to backend with items and delivery address
            // Backend will create order and return payment info
            const paymentPayload = {
                items: items,
                deliveryAddressId: deliveryAddress.id
            };

            const response = await requestPayment(paymentPayload);

            if (response.status === 'REQUIRES_PAYMENT') {
                navigate('/payment/checkout', {
                    state: {
                        orderId: response.orderId,
                        amount: response.amount,
                        orderName: items.length > 0 ? items[0].productName + (items.length > 1 ? ` 외 ${items.length - 1}건` : '') : '도서 주문',
                        customerName: deliveryAddress.receiver,
                        customerEmail: 'customer@example.com' // TODO: Get from user profile if available
                    }
                });
            } else {
                alert(`알 수 없는 상태: ${response.message || response.status}`);
            }

        } catch (err) {
            alert('결제 요청에 실패했습니다.');
            console.error(err);
        }
    };

    return (
        <div className="order-page-container">
            <h1 className="page-title">주문서</h1>

            <div className="order-content">
                <div className="left-column">
                    {/* Delivery Info */}
                    <section className="section-box delivery-info">
                        <div className="section-header">
                            <h2>
                                {deliveryAddress ? deliveryAddress.receiver : '배송지 선택'}
                                {deliveryAddress?.isDefault && <span className="default-badge">기본</span>}
                            </h2>
                            <button type="button" className="btn-outline-small" onClick={handleOpenAddressModal}>배송지 변경</button>
                        </div>
                        <p className="address-text">
                            {deliveryAddress
                                ? `[${deliveryAddress.zipcode}] ${deliveryAddress.address} ${deliveryAddress.addressDetail}`
                                : '선택된 배송지가 없습니다.'}
                        </p>
                        <p className="phone-text">{deliveryAddress?.phoneNumber || '-'}</p>
                        <select className="delivery-select">
                            <option>배송 요청사항을 선택해주세요</option>
                            <option>문 앞에 놓아주세요</option>
                            <option>배송 전 연락바랍니다</option>
                        </select>
                    </section>

                    {/* Order Items */}
                    <section className="section-box order-items">
                        <h3>주문 상품 {items.length}건</h3>
                        {items.map((item, idx) => (
                            <div key={idx} className="item-row">
                                <div className="item-img">
                                    <img src={item.productImageUrl} alt={item.productName} />
                                </div>
                                <div className="item-details">
                                    <p className="brand-name">{item.productType}</p>
                                    <p className="product-name">{item.productName}</p>
                                    <p className="item-meta">무료배송 / {item.quantity}개</p>
                                    <div className="price-area">
                                        <span className="original-price">{(item.price * 1.1).toLocaleString()}</span>
                                        <span className="final-item-price">{item.price.toLocaleString()} 원</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="shipping-guarantee">
                            <span className="blue-text">도착 보장</span> 22:00까지 주문 시 내일 도착 예정
                        </div>
                    </section>

                    {/* Discounts */}
                    <section className="section-box discounts">
                        <h3>쿠폰 적용</h3>
                        <div className="input-group">
                            <select disabled><option>적용 가능한 쿠폰이 없습니다</option></select>
                        </div>

                        <h3>포인트 사용</h3>
                        <div className="input-group point-input">
                            <input type="text" placeholder="0" disabled />
                            <span className="point-balance">보유 포인트: 5,599 원</span>
                        </div>
                    </section>

                    {/* Payment Method */}
                    {/* <section className="section-box payment-method">
                        <h3>결제 수단</h3>

                        <div className="payment-options">
                            <label className="radio-option">
                                <input type="radio" name="payment" defaultChecked />
                                <span className="radio-label">Musinsa Pay</span>
                            </label>
                            <label className="radio-option">
                                <input type="radio" name="payment" />
                                <span className="radio-label">Credit Card</span>
                            </label>
                            <label className="radio-option">
                                <input type="radio" name="payment" />
                                <span className="radio-label">Toss Pay</span>
                            </label>
                            <label className="radio-option">
                                <input type="radio" name="payment" />
                                <span className="radio-label">Kakao Pay</span>
                            </label>
                            <label className="radio-option">
                                <input type="radio" name="payment" />
                                <span className="radio-label">Payco</span>
                            </label>
                        </div>

                        <div className="payment-sub-options">
                            <select>
                                <option>Samsung Card</option>
                            </select>
                            <select>
                                <option>Lump Sum</option>
                            </select>
                        </div>
                    </section> */}
                </div>

                <div className="right-column">
                    <div className="sticky-summary">
                        <h3>결제 금액</h3>
                        <div className="summary-row">
                            <span>상품 금액</span>
                            <span>{initialPrice.toLocaleString()} 원</span>
                        </div>
                        <div className="summary-row">
                            <span>할인 금액</span>
                            <span className="discount-text">-{discount.toLocaleString()} 원</span>
                        </div>
                        <div className="summary-row">
                            <span>배송비</span>
                            <span>{shippingFee === 0 ? '무료' : shippingFee.toLocaleString() + ' 원'}</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>최종 결제 금액</span>
                            <span className="total-price">{finalPrice.toLocaleString()} 원</span>
                        </div>

                        <div className="benefits-info">
                            <div className="benefit-row">
                                <span>적립 예정 포인트</span>
                                <span>{Math.floor(finalPrice * 0.01).toLocaleString()} 원</span>
                            </div>
                        </div>

                        <div className="agreement-box">
                            <label>
                                <input type="checkbox" defaultChecked /> 주문 내용을 확인하였으며, 결제에 동의합니다.
                            </label>
                        </div>

                        <button className="pay-btn-lg" onClick={handlePayment}>
                            {finalPrice.toLocaleString()}원 결제하기
                        </button>
                    </div>
                </div>
            </div>
            {/* Address Selection Modal */}
            {isAddressModalOpen && (
                <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setIsAddressModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">배송지 선택</h3>
                            <button type="button" className="close-btn" onClick={() => setIsAddressModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <ul className="address-list">
                                {addressList.map(addr => (
                                    <li
                                        key={addr.id}
                                        className={`address-item ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAddressId(addr.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="address"
                                            className="item-radio"
                                            checked={selectedAddressId === addr.id}
                                            onChange={() => setSelectedAddressId(addr.id)}
                                        />
                                        <div className="item-info">
                                            {addr.isDefault && <span className="item-badge">기본</span>}
                                            <div className="item-receiver">
                                                {addr.receiver} <span className="item-phone">{addr.phoneNumber}</span>
                                            </div>
                                            <div className="item-address">
                                                [{addr.zipcode}] {addr.address} {addr.addressDetail}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                                {addressList.length === 0 && (
                                    <li style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                        등록된 배송지가 없습니다.
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={() => setIsAddressModalOpen(false)}>취소</button>
                            <button type="button" className="btn-primary" onClick={handleApplyAddress}>적용</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
