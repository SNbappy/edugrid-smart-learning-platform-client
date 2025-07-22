import axios from 'axios';
import React from 'react';

const axiosSecure = axios.create({
    baseURL: ''
})

const useAxiosSecure = () => {
    return axiosSecure;
};

export default useAxiosSecure;