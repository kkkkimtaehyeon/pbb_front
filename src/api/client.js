import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 쿠키(access & refresh) 자동 포함
});

client.interceptors.response.use(
    (response) => {
        // [성공 처리] HTTP 상태 코드가 200번대일 때 여기로 들어옵니다.
        if (response.data && typeof response.data.success === 'boolean') {
            if (response.data.success) {
                return response.data; // 성공 시 data만 깔끔하게 반환
            } else {
                // (참고) 백엔드에서 200 OK를 주면서 success: false를 주는 구조라면 여기서 처리합니다.
                console.log("Business logic error response", response);
                const message = response.data.meta?.message || 'Unknown error';
                const error = new Error(message);
                error.response = response;
                return Promise.reject(error);
            }
        }
        return response;
    },
    async (error) => {
        // [에러 처리] HTTP 상태 코드가 401, 403, 500 등일 때 여기로 들어옵니다.
        const originalRequest = error.config;

        // 1. 401 에러이고, 이전에 재발급 시도를 한 적이 없는 요청일 경우에만 실행 (무한 루프 방지)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 재시도 플래그 ON

            try {
                // Refresh Token을 이용해 Access Token 재발급 요청 (쿠키 사용)
                await axios.post(`${API_URL}/auth/reissue`, {}, {
                    withCredentials: true
                });

                // 재발급에 성공했다면, 브라우저 쿠키에 새 Access Token이 세팅되었을 것입니다.
                // 방금 실패했던 원래 요청을 다시 보냅니다.
                return client(originalRequest);

            } catch (reissueError) {
                console.error("Token reissue failed (Refresh Token expired)", reissueError);
                // Refresh Token마저 만료된 상황입니다.
                // TODO: 로그인 페이지로 강제 이동시키거나 상태 관리(Redux, Zustand 등)에서 로그아웃 처리
                // window.location.href = '/login';
                return Promise.reject(reissueError);
            }
        }

        // 2. 백엔드에서 내려준 ApiResponseMetaData 파싱 로직
        // 이제 백엔드에서 errorResponse를 JSON으로 주므로 여기서 에러 메시지를 예쁘게 꺼낼 수 있습니다.
        if (error.response && error.response.data && error.response.data.meta) {
            const { message, errorCode } = error.response.data.meta;
            if (message) {
                error.message = message; // axios 에러 객체의 메시지를 백엔드 메시지로 덮어씌움
            }
            if (errorCode) {
                error.code = errorCode; // 필요하다면 에러 코드도 추가
            }
        }

        return Promise.reject(error);
    }
);

export default client;