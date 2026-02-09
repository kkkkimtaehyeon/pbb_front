import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderDetail, cancelOrder } from '../api/orderService';

const OrderCancelPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [selectedItems, setSelectedItems] = useState([]);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const { targetOrderItemId } = location.state || {};

    // ... (lines 16-96 omitted for brevity, ensure they are preserved if I use multi_replace, but replace_file_content replaces the chunk)
    // Wait, I cannot use replace_file_content for multiple non-contiguous edits easily unless I select a large block.
    // I need to add state at line 13, and update UI at line 188, and update submit logic at line 97.
    // I should use multi_replace.


    useEffect(() => {
        if (!order) {
            loadOrder();
        } else if (targetOrderItemId) {
            // Already have order from state, but need to filter if targetOrderItemId is present
            // We can just rely on the rendering logic or filter the order state itself
            // Let's filter the display items for clarity
        }
    }, [orderId]);

    // Filter items to display
    const displayItems = order ? (targetOrderItemId ? order.items.filter(item => item.orderItemId === targetOrderItemId) : order.items) : [];

    const loadOrder = async () => {
        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order', error);
            // Mock data fallback... (keeping existing mock data logic for safety/dev if API fails)
            setOrder({
                orderId: orderId,
                items: [
                    {
                        orderItemId: 101,
                        status: 'PAYMENT_PENDING',
                        quantity: 1,
                        product: {
                            productId: 1,
                            name: '무신사 스탠다드 홈 BLDC 헤어 드라이기 [블랙]',
                            imageUrl: 'https://via.placeholder.com/80',
                            price: 69900,
                            brand: '무신사 스탠다드 홈'
                        }
                    },
                    {
                        orderItemId: 102,
                        status: 'PAYMENT_PENDING',
                        quantity: 2,
                        product: {
                            productId: 2,
                            name: '디오디너리 레티놀 0.5% 인 스쿠알란 30ml',
                            imageUrl: 'https://via.placeholder.com/80',
                            price: 26420,
                            brand: '디오디너리'
                        }
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize selectedItems based on targetOrderItemId
    useEffect(() => {
        if (order && targetOrderItemId) {
            const targetItem = order.items.find(item => item.orderItemId === targetOrderItemId);
            if (targetItem) {
                setSelectedItems([targetOrderItemId]);
            }
        }
    }, [order, targetOrderItemId]);


    const handleSelectAll = (e) => {
        if (e.target.checked && displayItems.length > 0) {
            setSelectedItems(displayItems.map(item => item.orderItemId));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            alert('취소할 상품을 선택해주세요.');
            return;
        }
        if (!cancelReason) {
            alert('취소 사유를 선택해주세요.');
            return;
        }

        let finalReason = cancelReason;
        if (cancelReason === '기타') {
            if (!customReason.trim()) {
                alert('취소 사유를 입력해주세요.');
                return;
            }
            finalReason = customReason;
        }

        try {
            // Processing per item as per requirement 2 and generic support
            // "주문취소 사유를 선택하고 취소요청 버튼을 누르면 /v2/orders/{orderId}/items/{orderItemId}/cancel에 post 요청을 보내"
            for (const itemId of selectedItems) {
                const item = order.items.find(i => i.orderItemId === itemId);
                if (item) {
                    // For now taking full quantity as per requirement "canccelQuantity: 0 // 일단 주문상품의 개수로 설정"
                    await import('../api/orderService').then(mod =>
                        mod.cancelOrderItem(orderId, itemId, { reason: finalReason, cancelQuantity: item.quantity })
                    );
                }
            }
            alert('취소 요청이 접수되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error('Cancel failed', error);
            alert('취소 요청 처리에 실패했습니다.');
        }
    };

    if (loading) return <div>불러오는 중...</div>;
    if (!order) return <div>주문 정보를 찾을 수 없습니다.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>주문 취소</h2>

            {/* Select All - Hide if single item target? Or keep for consistency but disabled/checked */}
            {!targetOrderItemId && (
                <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                        type="checkbox"
                        id="selectAll"
                        checked={displayItems.length > 0 && selectedItems.length === displayItems.length}
                        onChange={handleSelectAll}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <label htmlFor="selectAll" style={{ fontWeight: 'bold', cursor: 'pointer' }}>전체 선택</label>
                </div>
            )}

            {/* Item List */}
            <div style={{ marginBottom: '20px' }}>
                {displayItems.map(item => (
                    <div key={item.orderItemId} style={{ display: 'flex', gap: '15px', padding: '20px 0', borderBottom: '1px solid #eee' }}>
                        <div style={{ paddingTop: '5px' }}>
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.orderItemId)}
                                onChange={() => handleSelectItem(item.orderItemId)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                disabled={!!targetOrderItemId} // Disable unchecking if specifically targeted? Or allow user to bail out? Let's allow but default checked.
                            />
                        </div>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f4f4f4', borderRadius: '4px', overflow: 'hidden' }}>
                            {item.product.imageUrl ? (
                                <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>No Image</div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '5px' }}>
                                {item.product.name || '브랜드'}
                            </div>
                            {/* <div style={{ fontSize: '14px', marginBottom: '5px' }}>{item.price}원</div> */}
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>{item.quantity}개</div>
                            <div style={{ fontWeight: 'bold' }}>{(item.price || 0).toLocaleString()}원</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '13px', color: '#666', marginBottom: '40px' }}>
                • 입금 대기 중 취소는 전체 취소만 가능합니다.
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid #eee', marginBottom: '30px' }} />

            {/* Cancel Reason */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>취소 사유</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                {[
                    { val: '단순 변심 (상품이 필요 없어짐)', label: '단순 변심 (상품이 필요 없어짐)' },
                    { val: '주문 실수 (상품 또는 수량 잘못 선택, 추가 재주문)', label: '주문 실수 (상품 또는 수량 잘못 선택, 추가 재주문)' },
                    { val: '다른 결제 수단으로 변경', label: '다른 결제 수단으로 변경' },
                    { val: '기타', label: '기타' }
                ].map((reason) => (
                    <div key={reason.val}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="cancelReason"
                                value={reason.val}
                                checked={cancelReason === reason.val}
                                onChange={(e) => setCancelReason(e.target.value)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span style={{ fontSize: '15px', color: '#333' }}>{reason.label}</span>
                        </label>
                        {reason.val === '기타' && cancelReason === '기타' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="상세 사유를 입력해주세요."
                                style={{
                                    width: '100%',
                                    marginTop: '10px',
                                    padding: '10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    minHeight: '80px',
                                    fontSize: '14px'
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid #eee', marginBottom: '30px' }} />

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: 'black',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                취소 요청하기 ({selectedItems.length}개)
            </button>
        </div>
    );
};

export default OrderCancelPage;
