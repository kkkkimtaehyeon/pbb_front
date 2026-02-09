import React from 'react';
import './AdminHeader.css'; // Will create CSS or reuse inline styles for now

const AdminHeader = ({ title }) => {
    return (
        <header className="admin-header">
            <h3>{title}</h3>
            <div className="header-actions">
                <button className="icon-btn">🔔</button>
                <div className="admin-profile">
                    <span>👤 Admin</span>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
