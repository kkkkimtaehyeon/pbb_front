import client from './client';

export const signup = async (userData) => {
    const response = await client.post('/auth/signup', userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    // Server sets cookies. No need to capture token.
    return response.data;
};

export const adminLogin = async (credentials) => {
    const response = await client.post('/auth/admin/login', credentials);
    return response.data;
};

export const logout = async () => {
    await client.post('/auth/logout');
};

export const reissueToken = async () => {
    await client.post('/auth/reissue');
};
