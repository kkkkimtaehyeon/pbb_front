import client from './client';

// 6. My Account Info
export const getUserProfile = async () => {
    const response = await client.get('/members/me');
    return response.data;
};

// 3. My Delivery Addresses
export const getAddresses = async () => {
    const response = await client.get('/delivery-address');
    return response.data;
};

// 4. Add Delivery Address
export const addAddress = async (addressData) => {
    // addressData: { receiver, phoneNumber, zipcode, address, addressDetail, isDefault }
    const response = await client.post('/delivery-address', addressData);
    return response.data;
};

// 5. Delete Delivery Address
export const deleteAddress = async (addressId) => {
    await client.delete(`/delivery-address/${addressId}`);
};

export const getWishlist = async () => {
    const response = await client.get('/users/wishlist');
    return response.data;
};
