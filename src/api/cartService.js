import client from './client';

export const getCartItems = async () => {
    try {
        const response = await client.get('/carts');
        return response.data;
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
    }
};

export const addToCart = async (items) => {
    try {
        // items: [{ productId: 0, quantity: 0 }]
        const response = await client.post('/carts', { items });
        return response.data;
    } catch (error) {
        console.error('Error adding to cart:', error);
        throw error;
    }
};

export const removeCartItems = async (cartItemIds) => {
    try {
        // cartItemIds: [0, 1, ...]
        // Axios delete with body requires 'data' property in config
        const response = await client.delete('/carts', {
            data: { cartItemIds }
        });
        return response.data;
    } catch (error) {
        console.error('Error removing cart items:', error);
        throw error;
    }
};
