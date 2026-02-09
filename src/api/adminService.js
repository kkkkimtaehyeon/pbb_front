import client from './client';

export const createProduct = async (productData) => {
    const response = await client.post('/admin/products', productData);
    return response.data;
};

export const getAdminProducts = async (page = 0, size = 10, productType) => {
    const params = { page, size };
    if (productType) {
        params.productType = productType;
    }
    const response = await client.get('/admin/products', { params });
    return response.data;
};

export const getAdminOrders = async (page = 0, size = 10, status) => {
    const response = await client.get('/admin/orders', { params: { page, size, status } });
    return response.data;
};

export const getAdminOrderDetail = async (orderId) => {
    const response = await client.get(`/admin/orders/${orderId}`);
    return response.data;
};

export const getAdminProduct = async (productId) => {
    const response = await client.get(`/admin/products/${productId}`);
    return response.data;
};

export const updateProduct = async (productId, productData) => {
    const response = await client.put(`/admin/products/${productId}`, productData);
    return response.data;
};

export const searchAuthors = async (name) => {
    const response = await client.get('/admin/authors', { params: { name } });
    return response.data;
};

export const searchPublishers = async (name) => {
    const response = await client.get('/admin/publishers', { params: { name } });
    return response.data;
};

export const createDelivery = async (deliveryData) => {
    const { orderId, orderItemId, ...data } = deliveryData;
    const response = await client.post(`/admin/orders/${orderId}/items/${orderItemId}/deliveries`, data);
    return response.data;
};

export const getAdminClaims = async (params) => {
    const response = await client.get('/admin/orders/claims', { params });
    return response.data;
};

export const confirmAdminClaim = async (claimId) => {
    const response = await client.post(`/admin/orders/claims/${claimId}/confirm`);
    return response.data;
};
