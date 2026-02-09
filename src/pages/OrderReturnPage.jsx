import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrderDetail, returnOrderItem } from '../api/orderService';

const OrderReturnPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { order: initialOrder, targetOrderItemId } = location.state || {}; // Expect targetOrderItemId

    const [order, setOrder] = useState(initialOrder || null);
    const [loading, setLoading] = useState(!initialOrder);
    const [selectedItems, setSelectedItems] = useState(targetOrderItemId ? [targetOrderItemId] : []);
    const [returnReason, setReturnReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    useEffect(() => {
        if (!order) {
            loadOrder();
        }
    }, [orderId]);

    const loadOrder = async () => {
        try {
            const data = await getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to load order', error);
            // Fallback logic could go here if needed
        } finally {
            setLoading(false);
        }
    };

    // Filter items to display - similar to CancelPage, strict filtering if target exists
    const displayItems = order ? (targetOrderItemId ? order.items.filter(item => item.orderItemId === targetOrderItemId) : order.items) : [];

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
            alert('반품할 상품을 선택해주세요.');
            return;
        }
        if (!returnReason) {
            alert('반품 사유를 선택해주세요.');
            return;
        }

        let finalReason = returnReason;
        if (returnReason === '기타') {
            if (!customReason.trim()) {
                alert('반품 사유를 입력해주세요.');
                return;
            }
            finalReason = customReason;
        }

        try {
            for (const itemId of selectedItems) {
                const item = order.items.find(i => i.orderItemId === itemId);
                if (item) {
                    await returnOrderItem(orderId, itemId, { reason: finalReason, returnQuantity: item.quantity });
                }
            }
            alert('반품 요청이 접수되었습니다.');
            navigate('/mypage');
        } catch (error) {
            console.error('Return failed', error);
            alert('반품 요청 처리에 실패했습니다.');
        }
    };

    if (loading) return <div>불러오는 중...</div>;
    if (!order) return <div>주문 정보를 찾을 수 없습니다.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>반품 요청</h2>

            {/* Select All */}
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
                                disabled={!!targetOrderItemId}
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
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>{item.quantity}개</div>
                            <div style={{ fontWeight: 'bold' }}>{(item.price || 0).toLocaleString()}원</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '13px', color: '#666', marginBottom: '40px' }}>
                • 반품 시 배송비가 차감될 수 있습니다.
            </div>

            <hr style={{ border: 'none', borderBottom: '1px solid #eee', marginBottom: '30px' }} />

            {/* Return Reason */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>반품 사유</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px' }}>
                {[
                    { val: '단순 변심 (상품이 필요 없어짐)', label: '단순 변심 (상품이 필요 없어짐)' },
                    { val: '상품 불량/파손', label: '상품 불량/파손' },
                    { val: '오배송', label: '오배송' },
                    { val: '기타', label: '기타' }
                ].map((reason) => (
                    <div key={reason.val}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="returnReason"
                                value={reason.val}
                                checked={returnReason === reason.val}
                                onChange={(e) => setReturnReason(e.target.value)}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <span style={{ fontSize: '15px', color: '#333' }}>{reason.label}</span>
                        </label>
                        {reason.val === '기타' && returnReason === '기타' && (
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
                반품 요청하기 ({selectedItems.length}개)
            </button>
        </div>
    );
};

export default OrderReturnPage;
