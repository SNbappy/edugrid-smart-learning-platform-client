import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;
