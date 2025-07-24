import { MdDateRange } from 'react-icons/md';
import { getStatusStyle } from '../utils/attendanceUtils';

const AttendanceSessionCard = ({
    session,
    onUpdateAttendance,
    onViewDetails,
    isOwner,
    currentUserEmail
}) => {
    const presentCount = session.attendance.filter(record => record.status === 'present').length;
    const absentCount = session.attendance.filter(record => record.status === 'absent').length;
    const unmarkedCount = session.attendance.filter(record => record.status === 'unmarked').length;
    const totalStudents = session.attendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // Get current user's attendance status for this session
    const userAttendance = session.attendance.find(record => record.studentEmail === currentUserEmail);
    const userStatus = userAttendance?.status || 'unmarked';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{session.title}</h3>
                    <p className="text-gray-600 mb-2">{session.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                        <MdDateRange className="mr-1" />
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="text-right">
                    {isOwner ? (
                        <>
                            <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
                            <div className="text-sm text-gray-600">Class Attendance</div>
                        </>
                    ) : (
                        <>
                            <div className={`text-2xl font-bold ${getStatusStyle(userStatus).textColor}`}>
                                {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                            </div>
                            <div className="text-sm text-gray-600">Your Status</div>
                        </>
                    )}
                </div>
            </div>

            {isOwner ? (
                // Owner view - show class statistics
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{presentCount}</div>
                        <div className="text-sm text-green-600">Present</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{absentCount}</div>
                        <div className="text-sm text-red-600">Absent</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-600">{unmarkedCount}</div>
                        <div className="text-sm text-gray-600">Unmarked</div>
                    </div>
                </div>
            ) : (
                // Student view - show only their status
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Your attendance status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(userStatus).bgColor}`}>
                            {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={onViewDetails}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                    {isOwner ? 'Mark Attendance' : 'View Details'}
                </button>
                {isOwner && (
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                        Export
                    </button>
                )}
            </div>
        </div>
    );
};

export default AttendanceSessionCard;
