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
                return response.data; // Return the full envelope? No, plan said unwrap.
                // Wait, if I unwrap to response.data.data, I lose access to 'meta' if needed?
                // But usually we just need data. 
                // Let's stick to the plan: "return response.data.data"
                // BUT, wait. If I return response.data.data, then axios's response object structure is lost?
                // Axios interceptors usually return the *response object* or a *value*.
                // If I return a value here, the caller receives that value.
                // Standard axios caller expects: const response = await client.get(...); const data = response.data;
                // If I return `response.data.data` here, then `await client.get(...)` returns `response.data.data`.
                // Existing code: `const response = await client.get(...)`. `return response.data`.
                // Example `adminService.js`: `return response.data`.
                // If I change interceptor to return `response.data.data`, then `response` in service is `response.data.data`.
                // Then `service` returns `response.data` -> `response.data.data.data` -> Undefined!

                // CRITICAL CORRECTION:
                // Existing services (adminService.js) do:
                // `const response = await client.get(...)`
                // `return response.data`

                // If I modify the interceptor to return the unwrapped data, the `response` variable in `adminService.js` WILL BE the unwrapped data.
                // Then `response.data` will likely be undefined (unless the data itself has a data property).

                // So I must EITHER:
                // A) Update `client.js` to modify `response.data` IN PLACE (unwrap it into response.data).
                //    i.e. `response.data = response.data.data`.
                //    Then return `response`.
                //    service: `return response.data` -> returns the unwrapped data. Correct.

                // B) Update all services to NOT return `response.data` but just `response`.

                // Option A is cleaner for legacy services.
                // `response.data` becomes the actual payload.

                // However, what if `response.data.data` is primitive? Then `response.data` becomes primitive. Axios response.data can be any type.

                // Let's do Option A.

                // But wait, the plan said "return response.data.data".
                // If I return `response.data.data` directly in interceptor, axios resolves the promise with THAT value.
                // The `service` receives that value.
                // `const response = ... (unwrapped data now)`
                // `return response.data` -> fails.

                // So I should modify the RESPONSE OBJECT, not return the data directly, OR update services.
                // Updating services is a lot of work (10 files).
                // Modifying response object is better.

                response.data = response.data.data;
                return response;
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
                await axios.post('/api/auth/reissue', {}, {
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
