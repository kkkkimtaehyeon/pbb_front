import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Cookies (access & refresh) are handled automatically
});

client.interceptors.response.use(
    (response) => {
        // Handle ApiResponse format (standardized)
        if (response.data && typeof response.data.success === 'boolean') {
            if (response.data.success) {
                return response.data;
            } else {
                // Failure case
                const message = response.data.meta?.message || 'Unknown error';
                const error = new Error(message);
                error.response = response;
                return Promise.reject(error);
            }
        }

        // Fallback for non-standard responses (if any)
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            try {
                // Attempt to reissue via cookie. Server should update the access token cookie.
                await axios.post(`${API_URL}/auth/reissue`, {}, {
                    withCredentials: true
                });

                // Retry original request (browser will attach new cookies automatically)
                return client(originalRequest);
            } catch (reissueError) {
                console.error("Token reissue failed", reissueError);
                // Optionally redirect to login or notify user (handled by context usually)
                return Promise.reject(reissueError);
            }
        }

        // Handle standard API errors (where server returns meta info in error response)
        if (error.response && error.response.data && error.response.data.meta) {
            const { message, errorCode } = error.response.data.meta;
            if (message) {
                error.message = message;
            }
            if (errorCode) {
                error.code = errorCode; // Attach error code if available
            }
        }

        return Promise.reject(error);
    }
);

export default client;
