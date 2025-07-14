import React from 'react';

const DashboardStats = () => {
    const stats = [
        {
            title: 'Courses',
            value: '5',
            color: 'bg-orange-500',
            textColor: 'text-orange-600'
        },
        {
            title: 'Classes',
            value: '7',
            color: 'bg-green-500',
            textColor: 'text-green-600'
        },
        {
            title: 'Students',
            value: '120',
            color: 'bg-blue-500',
            textColor: 'text-blue-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center"
                >
                    <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} rounded-lg mb-4`}>
                        <span className="text-white font-bold text-lg">{stat.value}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.textColor} mb-1`}>
                        {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        {stat.title}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
