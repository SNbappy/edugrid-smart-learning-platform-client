import React from 'react';

const WeeklySchedule = () => {
    const timeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00',
        '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    const days = [
        { day: 'Mon', date: '14' },
        { day: 'Tue', date: '15' },
        { day: 'Wed', date: '16' },
        { day: 'Thu', date: '17' },
        { day: 'Fri', date: '18' },
        { day: 'Sat', date: '19' },
        { day: 'Sun', date: '20' }
    ];

    const scheduleData = [
        { day: 1, time: 0, subject: 'Applied Science', duration: 2, color: 'bg-red-300' },
        { day: 2, time: 2, subject: 'Technology', duration: 2, color: 'bg-blue-300' },
        { day: 2, time: 5, subject: 'UX Design', duration: 2, color: 'bg-yellow-300' },
        { day: 3, time: 4, subject: 'Artificial Intelligence', duration: 2, color: 'bg-green-300' },
        { day: 4, time: 6, subject: 'Business Management', duration: 2, color: 'bg-orange-300' },
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">WEEKLY COURSE SCHEDULE</h2>

            <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-1 min-w-[800px]">
                    {/* Header */}
                    <div className="p-3 font-semibold text-gray-600 text-sm">Week</div>
                    {days.map((day, index) => (
                        <div key={index} className="p-3 text-center">
                            <div className="font-semibold text-gray-800 text-sm">{day.date}</div>
                            <div className="text-xs text-gray-600">{day.day}</div>
                        </div>
                    ))}

                    {/* Time slots and schedule */}
                    {timeSlots.map((time, timeIndex) => (
                        <React.Fragment key={timeIndex}>
                            <div className="p-3 text-sm text-gray-600 font-medium border-r border-gray-100">
                                {time}
                            </div>
                            {days.map((day, dayIndex) => {
                                const event = scheduleData.find(
                                    item => item.day === dayIndex && item.time === timeIndex
                                );

                                return (
                                    <div key={dayIndex} className="p-1 border-r border-gray-50">
                                        {event && (
                                            <div
                                                className={`${event.color} rounded-md p-2 text-xs font-medium text-gray-800 h-12 flex items-center justify-center text-center`}
                                                style={{
                                                    gridRow: `span ${event.duration}`,
                                                }}
                                            >
                                                {event.subject}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeeklySchedule;
