import { createContext, useContext, useState, useEffect } from 'react';
import { logout as apiLogout } from '../api/authService';
// Import getUserProfile from userService (need to ensure it's exported)
import { getUserProfile } from '../api/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store full user profile
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            // Fetch profile on initial load, refresh, or re-check
            const profile = await getUserProfile();
            setUser(profile);
            setIsAuthenticated(true);
        } catch (error) {
            console.log('Not authenticated or session expired');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const loginSuccess = async () => {
        // Fetch profile immediately after successful login
        await checkAuth();
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, isLoading, loginSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
