import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminOrderDetail, createDelivery } from '../../api/adminService';
import './AdminOrderList.css'; // Reuse styles or create new one

const AdminOrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    // Remove order-level isRegistering and deliveryForm in favor of item-level if needed,
    // or keep them if the old section is still used.
    // But for "each product", we need individual state.
    const [itemDeliveryForms, setItemDeliveryForms] = useState({}); // { [orderItemId]: { company: '', trackingNumber: '' } }

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getAdminOrderDetail(orderId);
                setDetail(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [orderId]);

    const handleRegisterDelivery = async (orderItemId) => {
        const form = itemDeliveryForms[orderItemId];
        if (!form || !form.company || !form.trackingNumber) {
            alert('택배사와 운송장 번호를 모두 입력해주세요.');
            return;
        }

        try {
            await createDelivery({
                orderId: detail.orderId,
                orderItemId: orderItemId,
                company: form.company,
                trackingNumber: form.trackingNumber
            });
            alert('배송 정보가 등록되었습니다.');

            // Refresh detail to show updated status/delivery info
            // For now, we might just reload the page or fetch details again
            const updatedData = await getAdminOrderDetail(orderId);
            setDetail(updatedData);

            // Clear form
            setItemDeliveryForms(prev => {
                const newState = { ...prev };
                delete newState[orderItemId];
                return newState;
            });

        } catch (error) {
            console.error("Failed to register delivery", error);
            alert('배송 등록에 실패했습니다.');
        }
    };

    const handleItemFormChange = (orderItemId, field, value) => {
        setItemDeliveryForms(prev => ({
            ...prev,
            [orderItemId]: {
                ...prev[orderItemId],
                [field]: value
            }
        }));
    };

    if (loading) return <div style={{ padding: '20px' }}>불러오는 중...</div>;
    if (!detail) return <div style={{ padding: '20px' }}>주문 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="order-detail-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>주문 상세 조회</h2>

            {/* 1. 기본/배송 정보 */}
            <section style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>주문/배송 정보</h3>
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

            {/* Removed Order Level Delivery Section */}

            {/* 2. 주문 상품 정보 */}
            <section style={{ marginBottom: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>주문 상품 정보</h3>
                <div>
                    {detail.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                            {item.productImageUrl ? (
                                <img src={item.productImageUrl} alt={item.productName} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                                <div style={{ width: '60px', height: '80px', backgroundColor: '#eee', borderRadius: '4px' }}></div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.productName}</div>
                                <div style={{ color: '#666', fontSize: '0.9rem' }}>{item.productType} | {item.quantity}개</div>
                                <div style={{ marginTop: '5px', fontSize: '0.9rem', color: '#007bff' }}>
                                    {item.status?.displayName}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '300px' }}>
                                <div>{item.price.toLocaleString()}원</div>

                                {/* Delivery Input for PAYMENT_COMPLETED items */}
                                {item.status && item.status.status === 'PAYMENT_COMPLETED' && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                        <input
                                            placeholder="택배사"
                                            value={itemDeliveryForms[item.orderItemId]?.company || ''}
                                            onChange={(e) => handleItemFormChange(item.orderItemId, 'company', e.target.value)}
                                            style={{ width: '80px', padding: '4px', fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <input
                                            placeholder="운송장번호"
                                            value={itemDeliveryForms[item.orderItemId]?.trackingNumber || ''}
                                            onChange={(e) => handleItemFormChange(item.orderItemId, 'trackingNumber', e.target.value)}
                                            style={{ width: '100px', padding: '4px', fontSize: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <button
                                            onClick={() => handleRegisterDelivery(item.orderItemId)}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '0.8rem',
                                                backgroundColor: '#2ecc71',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            등록
                                        </button>
                                    </div>
                                )}

                                {/* Display Delivery Info if available */}
                                {item.delivery && (
                                    <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#28a745' }}>
                                        배송정보: {item.delivery.company} {item.delivery.trackingNumber}
                                    </div>
                                )}
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
                    onClick={() => navigate('/admin/orders')}
                    style={{ padding: '10px 30px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}
                >
                    목록으로
                </button>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;
