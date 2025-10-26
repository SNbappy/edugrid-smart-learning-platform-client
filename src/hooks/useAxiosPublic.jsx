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

        // Request interceptor - Automatically add token if user is logged in
        instance.interceptors.request.use(
            async (config) => {
                // Only add token if user exists (logged in)
                if (user) {
                    try {
                        const token = await user.getIdToken();
                        config.headers.Authorization = `Bearer ${token}`;
                        console.log('✅ Token added to request:', config.url);
                    } catch (error) {
                        console.error('❌ Error getting token:', error);
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle errors
        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.error('❌ 401 Unauthorized - Authentication required');
                }
                if (error.response?.status === 403) {
                    console.error('❌ 403 Forbidden - Access denied');
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [user]);

    return axiosPublic;
};

export default useAxiosPublic;
