import { MdCheckCircle, MdCancel, MdQuestionMark } from 'react-icons/md';
import { getStatusIcon, getStatusColor } from '../utils/attendanceUtils';

const SessionDetailsModal = ({ 
    session, 
    onClose, 
    onUpdateAttendance, 
    isOwner, 
    currentUserEmail 
}) => {
    // Filter attendance records based on user role
    const displayAttendance = isOwner 
        ? session.attendance 
        : session.attendance.filter(record => record.studentEmail === currentUserEmail);

    const handleStatusChange = (studentEmail, newStatus) => {
        onUpdateAttendance(session.id, studentEmail, newStatus);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{session.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">{session.description}</p>
                    <p className="text-sm text-gray-500">
                        Date: {new Date(session.date).toLocaleDateString()}
                    </p>
                    {!isOwner && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">You can only view your own attendance record.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {displayAttendance.map((record) => (
                        <AttendanceRecord
                            key={record.studentEmail}
                            record={record}
                            isOwner={isOwner}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                    >
                        {isOwner ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Individual attendance record component
const AttendanceRecord = ({ record, isOwner, onStatusChange }) => {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
                {getStatusIcon(record.status)}
                <div className="ml-3">
                    <p className="font-medium text-gray-900">{record.studentName}</p>
                    <p className="text-sm text-gray-500">{record.studentEmail}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
                {isOwner && (
                    <select
                        value={record.status}
                        onChange={(e) => onStatusChange(record.studentEmail, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="unmarked">Unmarked</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                )}
            </div>
        </div>
    );
};

export default SessionDetailsModal;
