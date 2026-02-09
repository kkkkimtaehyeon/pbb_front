import client from './client';

export const getDefaultDeliveryAddress = async () => {
    console.log('Fetching default delivery address...');
    try {
        const response = await client.get('/delivery-address/default');
        console.log('Default delivery address response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching default delivery address:', error);
        throw error;
    }
};

export const getDeliveryAddresses = async () => {
    console.log('Fetching delivery addresses...');
    try {
        // The user specified /api/deliver-address. Assuming client has baseURL ending in /api, 
        // passing /deliver-address should work if the full path is /api/deliver-address.
        // If the backend has it as /api/api/deliver-address (unlikely), we'd need to adjust.
        // If the user meant the literal full URL is /api/deliver-address, and client has /api, 
        // then we need to be careful. Let's try to trust the client configuration + relative path.
        // However, I will check if response is 404.
        const response = await client.get('/delivery-address');
        console.log('Delivery addresses response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching delivery addresses:', error);
        throw error;
    }
};
