import { useState, useEffect } from 'react';
import {
    MdClose,
    MdCheckCircle,
    MdCancel,
    MdCalendarToday,
    MdPeople
} from 'react-icons/md';
import Swal from 'sweetalert2';

const SessionDetailsModal = ({
    session,
    onClose,
    onUpdateAttendance,
    isOwner,
    currentUserEmail
}) => {
    const [attendance, setAttendance] = useState(session.attendance || []);
    const [updating, setUpdating] = useState(null); // Track which student is being updated

    // Sync with parent when session changes
    useEffect(() => {
        setAttendance(session.attendance || []);
    }, [session.attendance]);

    // Handle status change with optimistic updates
    const handleStatusChange = async (studentEmail, newStatus) => {
        // Update UI immediately (optimistic update)
        setAttendance(prev =>
            prev.map(record =>
                record.studentEmail === studentEmail
                    ? { ...record, status: newStatus, markedAt: new Date(), markedBy: currentUserEmail }
                    : record
            )
        );

        setUpdating(studentEmail);

        try {
            await onUpdateAttendance(session.id, studentEmail, newStatus);
        } catch (error) {
            // Revert on error
            setAttendance(session.attendance);
            Swal.fire('Error!', 'Failed to update attendance.', 'error');
        } finally {
            setUpdating(null);
        }
    };

    // Get status styling (removed 'late' option)
    const getStatusStyle = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'absent':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Calculate stats (removed 'late' from stats)
    const stats = {
        total: attendance.length,
        present: attendance.filter(s => s.status === 'present').length,
        absent: attendance.filter(s => s.status === 'absent').length,
        unmarked: attendance.filter(s => s.status === 'unmarked').length
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {/* Transparent modal container */}
            <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-md rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold mb-2">{session.title}</h2>
                            <div className="flex items-center space-x-4 text-blue-100 text-sm">
                                <div className="flex items-center">
                                    <MdCalendarToday className="mr-1" />
                                    {new Date(session.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <MdPeople className="mr-1" />
                                    {stats.total} Students
                                </div>
                            </div>
                            {session.description && (
                                <p className="mt-2 text-blue-100 text-sm">{session.description}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-1"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats (removed late stats) */}
                <div className="p-4 bg-gray-50 bg-opacity-50 border-b border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-green-50 bg-opacity-60 border border-green-200 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">{stats.present}</div>
                            <div className="text-xs text-green-600">Present</div>
                        </div>
                        <div className="bg-red-50 bg-opacity-60 border border-red-200 rounded-lg p-3">
                            <div className="text-lg font-bold text-red-600">{stats.absent}</div>
                            <div className="text-xs text-red-600">Absent</div>
                        </div>
                        <div className="bg-gray-50 bg-opacity-60 border border-gray-200 rounded-lg p-3">
                            <div className="text-lg font-bold text-gray-600">{stats.unmarked}</div>
                            <div className="text-xs text-gray-600">Unmarked</div>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="overflow-y-auto max-h-96 bg-white bg-opacity-60">
                    {attendance.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MdPeople className="mx-auto text-3xl mb-2" />
                            <p>No students in this session.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {attendance.map((student) => (
                                <div
                                    key={student.studentEmail}
                                    className="p-4 hover:bg-gray-50 hover:bg-opacity-70 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                {student.studentName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{student.studentName}</div>
                                                <div className="text-sm text-gray-600">{student.studentEmail}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {/* Current Status */}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(student.status)}`}>
                                                {student.status === 'present' && <MdCheckCircle className="inline mr-1" />}
                                                {student.status === 'absent' && <MdCancel className="inline mr-1" />}
                                                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                            </span>

                                            {/* Action Buttons (for teachers only) - removed late button */}
                                            {isOwner && (
                                                <div className="flex space-x-1">
                                                    {updating === student.studentEmail ? (
                                                        <div className="w-6 h-6 border-2 border-[#457B9D] border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusChange(student.studentEmail, 'present')}
                                                                disabled={student.status === 'present'}
                                                                className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Mark Present"
                                                            >
                                                                <MdCheckCircle />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(student.studentEmail, 'absent')}
                                                                disabled={student.status === 'absent'}
                                                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Mark Absent"
                                                            >
                                                                <MdCancel />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 bg-opacity-50 border-t border-gray-200 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        {stats.total} students • {stats.present} attended
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsModal;
