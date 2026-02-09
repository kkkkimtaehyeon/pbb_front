import client from './client';

export const getCategories = async () => {
    try {
        const response = await client.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};
