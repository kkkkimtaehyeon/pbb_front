import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAdmin = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>권한 확인 중...</div>;
    }

    // Role check: Admin only
    if (!isAuthenticated || user?.role !== 'ROLE_ADMIN') {
        // Redirect to login if not authenticated or not admin.
        // User could be authenticated but as 'ROLE_USER', in which case we might want a different message,
        // but for security simplification, redirecting to login or home is common.
        // Given the requirement "only accessible when ROLE_ADMIN", anything else is rejected.

        // If logged in but wrong role:
        if (isAuthenticated) {
            alert("관리자 권한이 필요합니다.");
            return <Navigate to="/" replace />;
        }

        // If not logged in:
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default RequireAdmin;
