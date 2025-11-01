import { useState } from 'react';
import { MdClose, MdFileDownload } from 'react-icons/md';
import { exportAttendanceRegisterPDF } from '../utils/attendanceRegisterExport';

const AttendanceRegisterModal = ({
    onClose,
    attendanceSessions,
    students,
    classroomName,
    isOwner = false,
    currentUserEmail = ''
}) => {
    const [isExporting, setIsExporting] = useState(false);

    // Sort sessions by date
    const sortedSessions = [...attendanceSessions].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    // Sort students by name
    const sortedStudents = [...students].sort((a, b) =>
        (a.name || a.email).localeCompare(b.name || b.email)
    );

    // Calculate attendance data for each student
    const getStudentAttendance = (studentEmail) => {
        const attendance = sortedSessions.map(session => {
            const record = session.attendance?.find(
                r => r.studentEmail?.toLowerCase() === studentEmail.toLowerCase()
            );
            return record?.status || 'absent';
        });

        const presentCount = attendance.filter(status => status === 'present').length;
        const totalSessions = sortedSessions.length;
        const percentage = totalSessions > 0
            ? Math.round((presentCount / totalSessions) * 100)
            : 0;

        return { attendance, presentCount, totalSessions, percentage };
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportAttendanceRegisterPDF(
                classroomName,
                sortedSessions,
                sortedStudents,
                getStudentAttendance,
                isOwner,
                currentUserEmail
            );
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Check if current row is the logged-in student
    const isCurrentStudent = (studentEmail) => {
        return studentEmail.toLowerCase() === currentUserEmail.toLowerCase();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-6 border-b border-slate-200">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                            Attendance Register
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">
                            {classroomName}
                            {!isOwner && (
                                <span className="ml-2 text-blue-600 font-medium">• Your View</span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="inline-flex items-center px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex-1 sm:flex-none justify-center"
                        >
                            {isExporting ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                                    <span className="hidden sm:inline">Exporting...</span>
                                    <span className="sm:hidden">Export...</span>
                                </>
                            ) : (
                                <>
                                    <MdFileDownload className="w-4 h-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Export PDF</span>
                                    <span className="sm:hidden ml-1">PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                        >
                            <MdClose className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Info Banner for Students */}
                {!isOwner && (
                    <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <span className="text-blue-600 text-base sm:text-lg flex-shrink-0">ℹ️</span>
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-blue-900">
                                    Your attendance record is highlighted in blue
                                </p>
                                <p className="text-xs text-blue-700 mt-0.5 sm:mt-1 hidden sm:block">
                                    You can see all students' attendance for transparency
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Container */}
                <div className="flex-1 overflow-auto p-3 sm:p-6">
                    {/* Mobile: Show scroll hint */}
                    <div className="sm:hidden mb-2 text-xs text-slate-500 text-center">
                        ← Scroll horizontally to view all sessions →
                    </div>

                    <div className="min-w-max">
                        <table className="w-full border-collapse border border-slate-300">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 text-left text-[11px] sm:text-sm font-semibold text-slate-900 sticky left-0 bg-slate-100 z-10 min-w-[140px] sm:min-w-[200px] md:min-w-[220px]">
                                        Student Name
                                    </th>
                                    {sortedSessions.map((session, index) => (
                                        <th
                                            key={session.id}
                                            className="border border-slate-300 px-2 sm:px-3 py-2 sm:py-3 text-center font-medium text-slate-700 min-w-[70px] sm:min-w-[100px]"
                                        >
                                            <div className="text-[10px] sm:text-xs">
                                                {new Date(session.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate max-w-[60px] sm:max-w-none mx-auto">
                                                {session.title}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-900 bg-blue-50 min-w-[80px] sm:min-w-[120px]">
                                        Present
                                    </th>
                                    <th className="border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-slate-900 bg-emerald-50 min-w-[60px] sm:min-w-[100px]">
                                        %
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStudents.map((student, studentIndex) => {
                                    const { attendance, presentCount, totalSessions, percentage } =
                                        getStudentAttendance(student.email);
                                    const isCurrentUserRow = !isOwner && isCurrentStudent(student.email);

                                    return (
                                        <tr
                                            key={student.email}
                                            className={`${isCurrentUserRow
                                                    ? 'bg-blue-50 border-l-2 sm:border-l-4 border-l-blue-500'
                                                    : studentIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                                } ${isCurrentUserRow ? 'ring-1 sm:ring-2 ring-blue-200' : ''}`}
                                        >
                                            <td className={`border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 font-medium sticky left-0 z-10 ${isCurrentUserRow ? 'bg-blue-50' : 'bg-inherit'
                                                }`}>
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    {/* Initial Avatar */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold text-[10px] sm:text-sm ${isCurrentUserRow
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {(student.name || student.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        {/* Online indicator for current user */}
                                                        {isCurrentUserRow && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className={`text-[11px] sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[140px] md:max-w-none ${isCurrentUserRow ? 'text-blue-900' : 'text-slate-900'
                                                            }`}>
                                                            {student.name || student.email}
                                                            {isCurrentUserRow && (
                                                                <span className="ml-1 sm:ml-2 text-[9px] sm:text-xs bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded-full font-semibold">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        {student.name && (
                                                            <div className="text-[9px] sm:text-xs text-slate-500 truncate hidden md:block max-w-[100px] sm:max-w-[140px] lg:max-w-none">
                                                                {student.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            {attendance.map((status, sessionIndex) => (
                                                <td
                                                    key={sessionIndex}
                                                    className={`border border-slate-300 px-2 sm:px-3 py-2 sm:py-3 text-center ${isCurrentUserRow ? 'bg-blue-50' : ''
                                                        }`}
                                                >
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm ${status === 'present'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {status === 'present' ? 'P' : 'A'}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className={`border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold ${isCurrentUserRow ? 'bg-blue-100' : 'bg-blue-50'
                                                }`}>
                                                <div className="text-xs sm:text-sm text-slate-900">
                                                    {presentCount}/{totalSessions}
                                                </div>
                                            </td>
                                            <td className={`border border-slate-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold ${isCurrentUserRow ? 'bg-emerald-100' : 'bg-emerald-50'
                                                }`}>
                                                <span className={`text-xs sm:text-sm ${percentage >= 80 ? 'text-emerald-700' :
                                                        percentage >= 60 ? 'text-amber-700' :
                                                            'text-red-700'
                                                    }`}>
                                                    {percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="border-t border-slate-200 p-3 sm:p-6 bg-slate-50">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                {sortedStudents.length}
                            </div>
                            <div className="text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-0">
                                <span className="hidden sm:inline">Total </span>Students
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                {sortedSessions.length}
                            </div>
                            <div className="text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-0">
                                <span className="hidden sm:inline">Total </span>Sessions
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                                {isOwner ? (
                                    <>
                                        {Math.round(
                                            sortedStudents.reduce((sum, student) => {
                                                const { percentage } = getStudentAttendance(student.email);
                                                return sum + percentage;
                                            }, 0) / sortedStudents.length
                                        )}%
                                    </>
                                ) : (
                                    <>
                                        {getStudentAttendance(currentUserEmail).percentage}%
                                    </>
                                )}
                            </div>
                            <div className="text-[10px] sm:text-sm text-slate-600 mt-0.5 sm:mt-0">
                                {isOwner ? (
                                    <>
                                        <span className="hidden sm:inline">Average </span>
                                        <span className="sm:hidden">Avg </span>
                                        Attendance
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Your </span>Attendance
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceRegisterModal;
