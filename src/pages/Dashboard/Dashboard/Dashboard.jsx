import { Helmet } from 'react-helmet-async';
import Sidebar from "./Sidebar";

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-poppins">
            <Helmet>
                <title>EduGrid | Dashboard</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

            </div>
        </div>
    );
};

export default Dashboard;