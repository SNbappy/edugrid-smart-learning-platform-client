import axios from 'axios';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../providers/AuthProvider';


const useAxiosPublic = () => {
    const { user } = useContext(AuthContext);


    const axiosPublic = useMemo(() => {
        const instance = axios.create({
            baseURL: 'https://edugrid-smart-learning-platform-ser.vercel.app/api',
            // baseURL: 'http://localhost:5000/api',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });


        // ✅ Define public routes that don't require authentication
        const publicRoutes = [
            '/users/',                    // GET user by email (login verification check)
            '/send-verification-code',    // POST send OTP
            '/verify-code'                // POST verify OTP
        ];


        // ✅ Helper function to check if route is public
        const isPublicRoute = (url) => {
            if (!url) return false;

            // Check if URL matches any public route
            return publicRoutes.some(route => {
                // Handle both relative and absolute URLs
                const urlPath = url.replace(instance.defaults.baseURL || '', '');
                return urlPath.includes(route);
            });
        };


        // 🔒 Request Interceptor - Add authentication token to protected routes
        instance.interceptors.request.use(
            async (config) => {
                const routeIsPublic = isPublicRoute(config.url);

                // Only add token if:
                // 1. User is logged in (user exists)
                // 2. Route is NOT public
                if (user && !routeIsPublic) {
                    try {
                        // Get fresh Firebase ID token
                        const token = await user.getIdToken();
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('✅ Token added to request:', config.url);
                    } catch (error) {
                        console.error('❌ Error getting Firebase token:', error);
                        // Don't block the request if token fetch fails
                    }
                } else if (routeIsPublic) {
                    console.log('🌐 Public route - no authentication needed:', config.url);
                } else if (!user) {
                    console.log('👤 No user logged in - proceeding without token:', config.url);
                }

                return config;
            },
            (error) => {
                console.error('❌ Request interceptor error:', error);
                return Promise.reject(error);
            }
        );


        // 🔒 Response Interceptor - Handle errors globally
        instance.interceptors.response.use(
            (response) => {
                // Pass through successful responses
                return response;
            },
            (error) => {
                // Handle specific error codes
                if (error.response) {
                    const { status, config } = error.response;

                    switch (status) {
                        case 401:
                            console.error('❌ 401 Unauthorized:', config.url);
                            console.error('   → Authentication required or token expired');
                            break;

                        case 403:
                            console.error('❌ 403 Forbidden:', config.url);
                            console.error('   → Access denied - insufficient permissions');
                            break;

                        case 404:
                            console.error('❌ 404 Not Found:', config.url);
                            break;

                        case 500:
                            console.error('❌ 500 Server Error:', config.url);
                            console.error('   → Backend server error');
                            break;

                        default:
                            console.error(`❌ ${status} Error:`, config.url);
                    }
                } else if (error.request) {
                    // Request was made but no response received
                    console.error('❌ No response from server:', error.message);
                    console.error('   → Check your internet connection or backend server status');
                } else {
                    // Something happened in setting up the request
                    console.error('❌ Request setup error:', error.message);
                }

                return Promise.reject(error);
            }
        );


        return instance;
    }, [user]); // Re-create instance when user changes (login/logout)


    return axiosPublic;
};


export default useAxiosPublic;
