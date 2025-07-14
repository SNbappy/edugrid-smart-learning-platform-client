import axios from "axios";

const axiosPublic = axios.create({
    baseURL: 'https://just-debate-club-server.vercel.app'
})
const useAxiosPublic = () => {
    return axiosPublic;
};

export default useAxiosPublic;