import React, { useState, useEffect } from 'react';
import { getAdminClaims, confirmAdminClaim } from '../../api/adminService';
import './AdminExchangePage.css';

const AdminExchangePage = () => {
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, CANCEL, RETURNS
    const [claims, setClaims] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchClaims();
    }, [activeTab, page]);

    const handleApprove = async (claimId) => {
        if (!window.confirm('승인 처리 하시겠습니까?')) return;

        try {
            await confirmAdminClaim(claimId);
            alert('승인되었습니다.');
            fetchClaims(); // Refresh list
        } catch (error) {
            console.error(error);
            alert(error.message || '승인 처리에 실패했습니다.');
        }
    };


    const fetchClaims = async () => {
        setLoading(true);
        try {
            let typeParam = null;
            if (activeTab === 'CANCEL') typeParam = 'CANCEL';
            if (activeTab === 'RETURNS') typeParam = 'RETURNS';

            const params = {
                page: page,
                size: 10,
            };

            if (typeParam) {
                params.claimType = typeParam;
            } else {
                // If ALL is selected, we might want to NOT send claimType if the backend supports it.
                // Or if backend requires it, we can't do ALL easily without multiple calls.
                // I'll assume omitting it might return all or it's not supported to get all at once.
                // Let's try omitting it.
            }

            const data = await getAdminClaims(params);

            setClaims(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch claims:", error);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeLabel = (type, status) => {
        if (type === 'CANCEL') return '취소';
        if (type === 'RETURNS') return '반품';
        return type;
    };

    const getBadgeClass = (type) => {
        switch (type) {
            case 'RETURNS': return 'return';
            case 'CANCEL': return 'cancel';
            default: return '';
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        // "1월 1일 12:00:00" format
        return date.toLocaleString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="exchange-page-container">
            {/* Stats Cards - Placeholder or could be aggregated */}
            {/* <div className="stats-container"> */}
            {/* <div className="stat-card"> */}
            {/* <div className="stat-title">전체</div> */}
            {/* <div className="stat-value total">{totalElements}</div> This is just for current page/filter */}
            {/* </div> */}
            {/* </div> */}

            {/* Tabs */}
            <div className="tabs-container">
                {['ALL', 'RETURNS', 'CANCEL'].map(tab => (
                    <div
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab); setPage(0); }}
                    >
                        {tab === 'ALL' && '전체보기'}
                        {tab === 'RETURNS' && '반품 요청'}
                        {tab === 'CANCEL' && '주문 취소'}
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="request-list">
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    claims.map(claim => (
                        <div key={claim.claim.id} className="request-card">
                            {/* Left Side */}
                            <div className="request-left">
                                <div className="request-header">
                                    <span className={`badge ${getBadgeClass(claim.claim.type)}`}>
                                        {getBadgeLabel(claim.claim.type, claim.claim.status)} - {claim.claim.status}
                                    </span>

                                    <div className="user-info">
                                        <div className="user-name">{claim.member.name}</div>
                                        {/* Phone is not in the response yet, using ID for now or hiding */}
                                        <div className="user-phone">ID: {claim.member.id}</div>
                                    </div>
                                </div>

                                <div className="request-date-row">
                                    <div className="request-date">{formatDate(claim.claim.claimedAt)}</div>
                                    <div className="order-no">주문번호 {claim.order.id}</div>
                                </div>

                                <div className="product-info">
                                    <img src={claim.product.imageUrl || 'https://via.placeholder.com/150'} alt={claim.product.name} className="product-img" />
                                    <div className="product-details">
                                        <div className="brand-name">상품ID: {claim.product.id}</div>
                                        <div className="product-name">{claim.product.name}</div>
                                        <div className="product-option">수량: {claim.orderItem.quantity}</div>
                                        <div className="price-row">
                                            {claim.payment.amount.toLocaleString()}원
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side */}
                            <div className="request-right">
                                <div className="reason-section">

                                    <div className="reason-title">사유</div>
                                    <div className="reason-box">
                                        <div className="reason-main">{claim.claim.reason}</div>
                                    </div>
                                    {
                                        claim.claim.type === 'RETURNS' && (
                                            <>
                                                <span><small>반송장번호: {claim.claim.returnTrackingNumber}</small></span>
                                            </>
                                        )
                                    }
                                    <div>
                                        <span><small>환불일시: {formatDate(claim.claim.refundedAt)}</small></span>
                                    </div>
                                    <div>
                                        <span><small>재고복구일시: {formatDate(claim.claim.stockRolledBackAt)}</small></span>
                                    </div>


                                </div>

                                {claim.claim.type === 'RETURNS' && claim.claim.status === 'REQUESTED' && (
                                    <div className="action-buttons">
                                        {/* Action buttons would go here. For now just placeholder or log */}
                                        {/* <button className="btn btn-reject">거절</button> */}
                                        <button
                                            className="btn btn-approve"
                                            onClick={() => handleApprove(claim.claim.id)}
                                        >
                                            승인
                                        </button>
                                    </div>
                                )}
                                {claim.claim.type === 'CANCEL' && claim.claim.status === 'REQUESTED' && (
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-approve"
                                            onClick={() => handleApprove(claim.claim.id)}
                                        >
                                            승인
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 0}>&lt;</button>
                <span>{page + 1} / {totalPages || 1}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1}>&gt;</button>
            </div>
        </div>
    );
};

export default AdminExchangePage;
