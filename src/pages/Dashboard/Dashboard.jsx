import React from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from '../../components/Dashboard/Sidebar';
import DashboardStats from '../../components/Dashboard/DashboardStats';
import WeeklySchedule from '../../components/Dashboard/WeeklySchedule';
import Calendar from '../../components/Dashboard/Calendar';
import UpcomingEvents from '../../components/Dashboard/UpcomingEvents';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-[#f8fafc] font-poppins">
            <Helmet>
                <title>EduGrid | Dashboard</title>
            </Helmet>

            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <div className="flex-1 ml-64">
                    {/* Header Stats */}
                    <div className="p-6">
                        <DashboardStats />

                        {/* Main Dashboard Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Weekly Schedule - Takes 2 columns */}
                            <div className="lg:col-span-2">
                                <WeeklySchedule />
                            </div>

                            {/* Right Sidebar - Takes 1 column */}
                            <div className="space-y-6">
                                <Calendar />
                                <UpcomingEvents />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
