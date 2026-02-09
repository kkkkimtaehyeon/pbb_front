import client from './client';

// GET /api/reviews?page=0&size=10
export const getReviews = async (page = 0, size = 10) => {
    try {
        const response = await client.get('/reviews', {
            params: { page, size }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// POST /api/reviews
// headers: 'Content-Type': 'multipart/form-data'
export const createReview = async (formData) => {
    try {
        const response = await client.post('/reviews', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};
