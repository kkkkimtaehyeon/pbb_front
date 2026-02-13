import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock Data (structure kept for reference/fallback)
    const mockData = {
        keyMetrics: {
            sales: { todayAmount: 2500000, growthRate: 15.5 },
            orders: { totalCount: 293, aov: 55000 },
            visitors: { currentActive: 1482, todayTotal: 5000, growthRate: 5.2 },
            conversionRate: 3.82
        },
        todoAlerts: {
            orderFunnel: {
                paymentPending: 12,
                paymentCompleted: 48,
                preparingShipment: 84,
                shipped: 156,
                delivered: 320,
                purchaseConfirm: 210
            },
            urgentClaims: { cancelRequest: 3, returnRequest: 3, exchangeRequest: 2 },
            lowStockProducts: [
                { productId: 101, productName: 'The Psychology of Money', productStock: 0 },
                { productId: 102, productName: 'Atomic Habits', productStock: 5 },
                { productId: 105, productName: 'Clean Code: A Handbook', productStock: 2 }
            ],
            cs: { unansweredInquiry: 4, newReview: 12 }
        },
        chartData: {
            hourlySales: [
                { hour: 9, todayAmt: 120000 }, { hour: 10, todayAmt: 180000 },
                { hour: 11, todayAmt: 250000 }, { hour: 12, todayAmt: 150000 },
                { hour: 13, todayAmt: 320000 }, { hour: 14, todayAmt: 280000 },
                { hour: 15, todayAmt: 260000 }, { hour: 16, todayAmt: 220000 }
            ],
            topBestsellers: [
                { rank: 1, productId: 201, productName: 'Greatest Gatsby', productImageUrl: 'https://via.placeholder.com/40', salesCount: 842 },
                { rank: 2, productId: 202, productName: 'The Midnight Library', productImageUrl: 'https://via.placeholder.com/40', salesCount: 712 },
                { rank: 3, productId: 203, productName: 'Project Hail Mary', productImageUrl: 'https://via.placeholder.com/40', salesCount: 650 },
                { rank: 4, productId: 204, productName: 'Dune: Part One', productImageUrl: 'https://via.placeholder.com/40', salesCount: 592 },
                { rank: 5, productId: 205, productName: 'Thinking Fast & Slow', productImageUrl: 'https://via.placeholder.com/40', salesCount: 420 },
            ]
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Uncomment to use real API
                const response = await getDashboardStats();
                setData(response);

                // Using Mock Data (Comment out when real API is ready)
                // setTimeout(() => {
                //    setData(mockData);
                //    setLoading(false);
                // }, 500);

            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loading">Loading...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;
    if (!data) return null;

    const { keyMetrics, todoAlerts, chartData } = data;

    // --- Helpers & Components ---

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KRW' }).format(amount || 0).replace('₩', '₩ ');
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('ko-KR').format(num || 0);
    };

    const Icons = {
        Wallet: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>,
        Cart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
        Eye: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
        Target: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
        Box: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    };

    const Trend = ({ value }) => {
        const val = value || 0;
        const isPositive = val >= 0;
        return (
            <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '↗' : '↘'} {Math.abs(val)}%
            </span>
        );
    };

    const getSparklinePath = (dataPoints) => {
        if (!dataPoints || dataPoints.length === 0) return "";
        const maxVal = Math.max(...dataPoints.map(d => d.todayAmt)) || 100;
        const minVal = 0;
        const width = 100;
        const height = 40;

        const points = dataPoints.map((d, i) => {
            const x = (i / (dataPoints.length - 1)) * width;
            const y = height - ((d.todayAmt - minVal) / (maxVal - minVal)) * height;
            return `${x},${y}`;
        });
        return `M${points.join(' L')}`;
    };

    return (
        <div className="dashboard-container">
            {/* Top Metrics Row */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <div className="icon-box blue"><Icons.Wallet /></div>
                        <Trend value={keyMetrics?.sales?.growthRate} />
                    </div>
                    <div className="metric-label">Today's Sales</div>
                    <div className="metric-value">{formatCurrency(keyMetrics?.sales?.todayAmount)}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="icon-box purple"><Icons.Cart /></div>
                        <span className="metric-sub">AOV: {formatCurrency(keyMetrics?.orders?.aov)}</span>
                    </div>
                    <div className="metric-label">Order Count</div>
                    <div className="metric-value">{formatNumber(keyMetrics?.orders?.totalCount)}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="icon-box orange"><Icons.Eye /></div>
                        <span className="live-badge">● Live</span>
                    </div>
                    <div className="metric-label">Active Visitors</div>
                    <div className="metric-value">{formatNumber(keyMetrics?.visitors?.currentActive)}</div>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <div className="icon-box green"><Icons.Target /></div>
                        <Trend value={keyMetrics?.conversionRate} />
                    </div>
                    <div className="metric-label">Conversion Rate</div>
                    <div className="metric-value">{keyMetrics?.conversionRate || 0}%</div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="mid-section-grid">
                {/* Order Status Funnel */}
                <div className="dashboard-card funnel-card">
                    <div className="card-header">
                        <h3><span role="img" aria-label="clipboard">📋</span> Order Status Funnel</h3>
                    </div>
                    <div className="funnel-list">
                        <div className="funnel-item">
                            <span className="f-label">Waiting for Payment</span>
                            <span className="f-count">{todoAlerts?.orderFunnel?.paymentPending || 0}</span>
                        </div>
                        <div className="funnel-item active">
                            <span className="f-label">Paid (To Process)</span>
                            <span className="f-count highlight">{todoAlerts?.orderFunnel?.paymentCompleted || 0}</span>
                        </div>
                        <div className="funnel-item">
                            <span className="f-label">Preparing Shipment</span>
                            <span className="f-count">{todoAlerts?.orderFunnel?.preparingShipment || 0}</span>
                        </div>
                        <div className="funnel-item">
                            <span className="f-label">Shipping in Transit</span>
                            <span className="f-count">{todoAlerts?.orderFunnel?.shipped || 0}</span>
                        </div>
                        <div className="funnel-item">
                            <span className="f-label">Delivered</span>
                            <span className="f-count">{todoAlerts?.orderFunnel?.delivered || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Urgent Claims */}
                <div className="dashboard-card claims-card">
                    <div className="card-header">
                        <h3><span role="img" aria-label="warning">❗</span> Urgent Claims</h3>
                        <span className="action-badge">{(todoAlerts?.urgentClaims?.cancelRequest || 0) + (todoAlerts?.urgentClaims?.returnRequest || 0)} Action Required</span>
                    </div>
                    <div className="claims-blocks">
                        <div className="claim-block">
                            <span className="c-count red">{todoAlerts?.urgentClaims?.cancelRequest || 0}</span>
                            <span className="c-label">Cancel</span>
                        </div>
                        <div className="claim-block">
                            <span className="c-count orange">0</span>
                            <span className="c-label">Exchange</span>
                        </div>
                        <div className="claim-block">
                            <span className="c-count red">{todoAlerts?.urgentClaims?.returnRequest || 0}</span>
                            <span className="c-label">Return</span>
                        </div>
                    </div>
                </div>

                {/* Inventory Alerts */}
                <div className="dashboard-card inventory-card">
                    <div className="card-header">
                        <h3><span role="img" aria-label="box">📦</span> Inventory Alerts</h3>
                    </div>
                    <div className="inventory-list">
                        {todoAlerts?.lowStockProducts && todoAlerts.lowStockProducts.length > 0 ? (
                            todoAlerts.lowStockProducts.map((p, i) => (
                                <div className="inventory-item" key={i}>
                                    <div className="inv-icon"><Icons.Box /></div>
                                    <div className="inv-info">
                                        <div className="inv-name">{p.productName}</div>
                                        <div className={`inv-status ${p.productStock === 0 ? 'out' : 'low'}`}>
                                            {p.productStock === 0 ? 'Out of stock' : `Low stock (${p.productStock} left)`}
                                        </div>
                                    </div>
                                    <button className="inv-action">⋮</button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No inventory alerts</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section-grid">
                {/* Hourly Sales Trends */}
                <div className="dashboard-card chart-card">
                    <div className="card-header">
                        <div>
                            <h3>Hourly Sales Trends</h3>
                            <span className="sub-header">Real-time revenue tracking</span>
                        </div>
                        <select className="time-select"><option>Today</option></select>
                    </div>
                    <div className="chart-container">
                        {chartData?.hourlySales && chartData.hourlySales.length > 0 ? (
                            <div className="svg-chart-wrapper">
                                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="trend-chart">
                                    <path d={getSparklinePath(chartData.hourlySales)} fill="none" stroke="#6366f1" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path d={`${getSparklinePath(chartData.hourlySales)} V 40 H 0 Z`} fill="url(#gradient)" stroke="none" />
                                </svg>
                                <div className="chart-labels">
                                    {chartData.hourlySales.map((d, i) => (
                                        (i % 2 === 0 || i === chartData.hourlySales.length - 1) &&
                                        <span key={i} style={{ left: `${(i / (chartData.hourlySales.length - 1)) * 100}%` }}>{d.hour}:00</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="no-data">No sales data available today</div>
                        )}
                    </div>
                </div>

                {/* Top Bestsellers */}
                <div className="dashboard-card bestsellers-card">
                    <div className="card-header">
                        <h3>Best Seller Top 5</h3>
                        <a href="#" className="view-all">View All</a>
                    </div>
                    <div className="bestsellers-list">
                        {chartData?.topBestsellers && chartData.topBestsellers.length > 0 ? (
                            chartData.topBestsellers.map((b, i) => (
                                <div className="bestseller-item" key={i}>
                                    <span className="bs-rank">{b.rank}</span>
                                    <div className="bs-img">
                                        <img src={b.productImageUrl} alt={b.productName} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40'; }} />
                                    </div>
                                    <div className="bs-info">
                                        <div className="bs-name">{b.productName}</div>
                                        <div className="bs-sales">{b.salesCount} copies</div>
                                    </div>
                                    <span className={`bs-trend ${i < 2 ? 'up' : 'down'}`}>{i < 2 ? '▲' : i > 3 ? '-' : '▼'}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No bestsellers data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;