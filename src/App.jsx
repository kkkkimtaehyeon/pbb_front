import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BookListPage from './pages/BookListPage';
import BookDetailPage from './pages/BookDetailPage';
import CartPage from './pages/CartPage';
import OrderPage from './pages/OrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderCancelPage from './pages/OrderCancelPage';
import OrderReturnPage from './pages/OrderReturnPage';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import PaymentCheckoutPage from './pages/PaymentCheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailPage from './pages/PaymentFailPage';
import './index.css';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminProductList from './pages/admin/AdminProductList';
import AdminProductCreate from './pages/admin/AdminProductCreate';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminExchangePage from './pages/admin/AdminExchangePage';
import RequireAdmin from './components/auth/RequireAdmin';
function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <div className="app-container">
                    <Routes>
                        <Route path="/" element={<Navigate to="/books" replace />} />
                        <Route path="/books" element={<BookListPage />} />
                        <Route path="/books/:id" element={<BookDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/order" element={<OrderPage />} />
                        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="/orders/:orderId/cancel" element={<OrderCancelPage />} />
                        <Route path="/orders/:orderId/return" element={<OrderReturnPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/payment/checkout" element={<PaymentCheckoutPage />} />
                        <Route path="/payment/success" element={<PaymentSuccessPage />} />
                        <Route path="/payment/fail" element={<PaymentFailPage />} />
                        <Route path="/payment/fail" element={<PaymentFailPage />} />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <RequireAdmin>
                                <AdminLayout />
                            </RequireAdmin>
                        }>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="orders" element={<AdminOrderList />} />
                            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                            <Route path="products" element={<AdminProductList />} />
                            <Route path="products/new" element={<AdminProductCreate />} />
                            <Route path="products/edit/:id" element={<AdminProductCreate />} />
                            <Route path="stock" element={<AdminPlaceholder title="재고 관리" />} />
                            <Route path="members" element={<AdminPlaceholder title="회원 관리" />} />
                            <Route path="claims" element={<AdminExchangePage />} />
                            <Route path="payments" element={<AdminPlaceholder title="결제/정산 관리" />} />
                            <Route path="reviews" element={<AdminPlaceholder title="리뷰/콘텐츠 관리" />} />
                            <Route path="stats" element={<AdminPlaceholder title="통계/리포트" />} />
                            <Route path="system" element={<AdminPlaceholder title="시스템 관리" />} />
                        </Route>
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
