import client from './client';

export const getBookList = async (page = 0, size = 10, sort = []) => {
    try {
        const params = {
            page,
            size,
        };
        if (sort.length > 0) {
            params.sort = sort;
        }
        const response = await client.get('/v2/books', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching book list:', error);
        throw error;
    }
};

export const getBookDetail = async (id) => {
    try {
        const response = await client.get(`/v2/books/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching book detail for id ${id}:`, error);
        throw error;
    }
};
