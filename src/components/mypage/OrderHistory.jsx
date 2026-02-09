import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, confirmOrderItem } from '../../api/orderService';
import { createReview } from '../../api/reviewService';
import ReviewModal from './ReviewModal';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const navigate = useNavigate();

    const openReviewModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsReviewOpen(true);
    };

    const handleReviewSubmit = async (formData) => {
        try {
            await createReview(formData);
            alert('리뷰가 등록되었습니다.');
            setIsReviewOpen(false);
        } catch (error) {
            console.error(error);
            alert('리뷰 등록에 실패했습니다.');
        }
    };

    const handleConfirmPurchase = async (orderId, orderItemId) => {
        if (window.confirm('상품을 구매 확정하시겠습니까?')) {
            try {
                await confirmOrderItem(orderId, orderItemId);
                alert('구매 확정되었습니다.');
                loadOrders(); // Refresh list to update status
            } catch (error) {
                console.error(error);
                alert('구매 확정 처리에 실패했습니다.');
            }
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await getOrders();
            // The new API structure returns: { content: [...], totalElements: ..., ... }
            // We use response.content for the list of orders.
            // If the API returns the list directly (old behavior), fallback to it.
            setOrders(response.content || response);
        } catch (error) {
            console.error('Failed to load orders, using mock data:', error);

        } finally {
            setLoading(false);
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PAYMENT_PENDING': return '입금 대기 중';
            case 'PAID': return '결제 완료';
            case 'PREPARING_SHIPMENT': return '배송 준비 중';
            case 'SHIPPED': return '배송 중';
            case 'DELIVERED': return '배송 완료';
            case 'PURCHASE_CONFIRMED': return '구매 확정';
            case 'CANCELLED': return '취소 완료';
            default: return status;
        }
    };

    // Helper to format date "26.02.04(수)" style
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const yy = date.getFullYear().toString().slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
        return `${yy}.${mm}.${dd}(${weekDay})`;
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>주문 내역</h3>

            {/* Search Bar Placeholder matching the image */}
            {/* <div style={{ position: 'relative', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="상품명 / 브랜드명으로 검색하세요."
                    style={{
                        width: '100%',
                        padding: '12px 15px',
                        paddingRight: '40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9'
                    }}
                />
                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>🔍</span>
            </div> */}

            {/* Filter Tabs Placeholder */}
            {/* <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '8px', cursor: 'pointer' }}>전체</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>온라인 주문</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>오프라인 구매</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>상품권</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>티켓</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>픽업</span>
            </div> */}

            {orders.length === 0 ? (
                <div style={{ padding: '50px 0', textAlign: 'center', color: '#888' }}>주문 내역이 없습니다.</div>
            ) : (
                <div className="order-list">
                    {orders.map(order => (
                        <div key={order.orderId} style={{ marginBottom: '40px' }}>
                            {/* Order Date Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatDate(order.orderDate)}</div>
                                <button
                                    onClick={() => navigate(`/orders/${order.orderId}`)}
                                    style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}
                                >
                                    주문 상세
                                </button>
                            </div>

                            {/* Order Items */}
                            {order.items.map((item, index) => (
                                <div key={item.orderItemId || index} style={{ marginBottom: '20px' }}>
                                    {/* Status Section */}
                                    <div style={{ marginBottom: '10px' }}>
                                        <span style={{ fontWeight: 'bold', color: item.status === 'CANCELLED' ? '#333' : '#333' }}>
                                            {item.status.displayName}
                                        </span>
                                        {/* Additional status info matching the image style (mocked for now) */}
                                        {item.status === 'PAYMENT_PENDING' && (
                                            <span style={{ color: '#007aff', fontSize: '13px', marginLeft: '5px' }}>
                                                🚚 무배당발 <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>입금 후 도착보장일 확인 가능</span>
                                            </span>
                                        )}
                                        {item.status === 'CANCELLED' && (
                                            <span style={{ fontSize: '13px', marginLeft: '5px', color: '#666' }}>
                                                입금 전 취소 완료
                                            </span>
                                        )}
                                    </div>

                                    {/* Product Card */}
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        {/* Image */}
                                        <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                            {item.product.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>No Image</div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                                                {item.product.name || '브랜드명(Mock)'}
                                            </div>
                                            {/* <div style={{ fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {item.price.toLocaleString()}원
                                            </div> */}
                                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                                                {/* Option / Quantity display - assuming free size/option for now or extracting from name */}
                                                {item.quantity}개
                                            </div>
                                            <div style={{ fontWeight: 'bold' }}>{(item.price || 0).toLocaleString()}원</div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        {item.status.status === 'PURCHASE_CONFIRMED' ? (
                                            <>
                                                <button
                                                    onClick={() => openReviewModal(order.orderId)}
                                                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '4px', background: '#262626', color: 'white', cursor: 'pointer' }}
                                                >
                                                    리뷰 쓰기
                                                </button>
                                                <button
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                >
                                                    재구매
                                                </button>
                                            </>
                                        ) : item.status.status === 'CANCELLED' || item.status.status === 'ORDER_CANCELLED' ? (
                                            // Requirement 2: No buttons if CANCELLED
                                            null
                                        ) : item.status.status === 'DELIVERED' ? (
                                            <>
                                                <button
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                >
                                                    배송 조회
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/orders/${order.orderId}/return`, { state: { order, targetOrderItemId: item.orderItemId } })}
                                                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                >
                                                    반품 요청
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmPurchase(order.orderId, item.orderItemId)}
                                                    style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '4px', background: '#262626', color: 'white', cursor: 'pointer' }}
                                                >
                                                    구매 확정
                                                </button>
                                            </>
                                        ) : (['SHIPPED', 'DELIVERING', 'DELIVERED'].includes(item.status.status)) ? (
                                            <button
                                                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                            >
                                                배송 조회
                                            </button>
                                        ) : (
                                            // PAYMENT_PENDING, PREPARING_SHIPMENT
                                            <>
                                                {item.status.status === 'PAYMENT_PENDING' || item.status.status === 'PAYMENT_COMPLETED' && (
                                                    <button
                                                        onClick={() => navigate(`/orders/${order.orderId}/cancel`, { state: { order, targetOrderItemId: item.orderItemId } })}
                                                        style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                                                    >
                                                        주문 취소
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Divider unless it's the last item */}
                                    {index < order.items.length - 1 && (
                                        <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '20px 0' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                onSubmit={handleReviewSubmit}
                orderId={selectedOrderId}
            />
        </div>
    );
};

export default OrderHistory;
