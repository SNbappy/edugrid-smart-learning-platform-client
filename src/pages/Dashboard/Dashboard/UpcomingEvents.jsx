import React from 'react';

const UpcomingEvents = () => {
    const events = [
        {
            title: 'Applied Science Homework',
            date: '2nd of February - Tuesday',
            time: '11:30 - 12:30',
            color: 'bg-red-500'
        },
        {
            title: 'Technology Exam',
            date: '3rd of February - Wednesday',
            time: '11:40 - 12:30',
            color: 'bg-orange-500'
        },
        {
            title: 'Artificial Intelligence Workshop',
            date: '5th of February - Tuesday',
            time: '11:30 - 12:30',
            color: 'bg-yellow-500'
        },
        {
            title: 'UX Design Conference',
            date: '8th of February - Monday',
            time: '11:30 - 12:30',
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Upcoming Events</h3>
            <p className="text-xs text-gray-500 mb-4">1st Feb Monday - 7th Feb Sunday</p>

            <div className="space-y-3">
                {events.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs">⏰</span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-800">
                                    {event.title}
                                </h4>
                            </div>
                            <p className="text-xs text-gray-600">{event.date}</p>
                            <p className="text-xs text-gray-500">⏰ {event.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingEvents;
