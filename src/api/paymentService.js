import client from './client';

export const requestPayment = async (paymentData) => {
    // paymentData: { orderId, amount }
    try {
        const response = await client.post('/v2/payments', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error requesting payment:', error);
        throw error;
    }
};

export const confirmPayment = async (confirmData) => {
    // confirmData: { paymentKey, orderId, amount }
    try {
        const response = await client.post('/v2/payments/confirm', confirmData);
        return response.data;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};
