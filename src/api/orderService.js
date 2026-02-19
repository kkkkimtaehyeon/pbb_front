import client from './client';

export const createOrder = async (orderData) => {
    try {
        // orderData: { items: [{ productId, discountAmount, price, quantity }], deliveryAddressId }
        const response = await client.post('/v2/orders', orderData);
        // Expecting response: { success: true, data: { orderId, paymentAmount }, meta: ... }
        return response;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// 1. My Orders List
export const getOrders = async () => {
    const response = await client.get('/v2/orders');
    return response.data;
};

// 2. Order Detail
export const getOrderDetail = async (orderId) => {
    const response = await client.get(`/v2/orders/${orderId}`);
    return response.data;
};
// 3. Cancel Order (Single Item)
export const cancelOrderItem = async (orderId, orderItemId, { reason, cancelQuantity }) => {
    const response = await client.post(`/v2/orders/${orderId}/items/${orderItemId}/cancel`, {
        cancelReason: reason,
        cancelQuantity
    });
    return response.data;
};

// 4. Return Order (Single Item)
export const returnOrderItem = async (orderId, orderItemId, { reason, returnQuantity }) => {
    const response = await client.post(`/v2/orders/${orderId}/items/${orderItemId}/return`, {
        returnReason: reason,
        returnQuantity
    });
    return response.data;
};

// 5. Confirm Purchase
export const confirmOrderItem = async (orderId, orderItemId) => {
    const response = await client.post(`/v2/orders/${orderId}/items/${orderItemId}/confirm`);
    return response.data;
};

// Keep deprecated/other methods if needed, but for now focusing on the requirements
export const cancelOrder = async (orderId, { orderItemIds, reason }) => {
    const response = await client.post(`/v2/orders/${orderId}/cancel`, { orderItemIds, reason });
    return response.data;
};
