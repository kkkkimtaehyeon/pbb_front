import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetail } from '../api/orderService';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getOrderDetail(orderId);
                setDetail(data);
            } catch (error) {
                console.error(error);
                // Mock data fallback
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [orderId]);

    if (loading) return <div style={{ padding: '20px' }}>불러오는 중...</div>;
    if (!detail) return <div style={{ padding: '20px' }}>주문 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="order-detail-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>주문 상세 조회</h2>

            {/* 1. 기본/배송 정보 */}
            <section style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>주문 정보</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px' }}>
                    <div style={{ color: '#666' }}>주문 번호</div>
                    <div>{detail.orderId}</div>

                    <div style={{ color: '#666' }}>주문 일자</div>
                    <div>{detail.orderedAt}</div>

                    <div style={{ color: '#666' }}>받는 사람</div>
                    <div>{detail.address?.receiver} / {detail.address?.phoneNumber}</div>

                    <div style={{ color: '#666' }}>배송지</div>
                    <div>
                        [{detail.address?.zipcode}] {detail.address?.address} {detail.address?.addressDetail}
                    </div>
                </div>
            </section>

            {/* 1.5. (Deleted) Order Level Delivery Info - Moved to Items */}

            {/* 2. 주문 상품 정보 */}
            <section style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>주문 상품 정보</h3>
                <div>
                    {detail.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center' }}>
                            {item.productImageUrl ? (
                                <img src={item.productImageUrl} alt={item.productName} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                                <div style={{ width: '60px', height: '80px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.productName}</div>
                                <div style={{ color: '#666' }}>{item.status?.displayName}</div>
                                {item.delivery && (
                                    <div style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '4px' }}>
                                        {item.delivery.company} {item.delivery.trackingNumber}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div>{item.price.toLocaleString()}원</div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{item.quantity}개</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. 결제 정보 */}
            <section style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>결제 정보</h3>
                {detail.payment ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '10px' }}>
                        <div style={{ color: '#666' }}>결제 수단</div>
                        <div>{detail.payment.paymentMethod}</div>

                        <div style={{ color: '#666' }}>총 결제 금액</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{detail.payment.amount.toLocaleString()}원</div>
                    </div>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '4px' }}>
                        결제 정보가 없습니다. (입금 대기중 또는 결제 전)
                    </div>
                )}
            </section>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/mypage')}
                    style={{ padding: '10px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                >
                    목록으로
                </button>
            </div>
        </div>
    );
};

export default OrderDetailPage;
