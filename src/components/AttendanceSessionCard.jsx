import { MdDateRange, MdPeople, MdVisibility, MdCheckCircle, MdCancel, MdSchedule, MdDelete } from 'react-icons/md';
import { useMemo, useState } from 'react';


const AttendanceSessionCard = ({
    session,
    onUpdateAttendance,
    onViewDetails,
    onSessionUpdate,
    onDeleteSession, // New prop for delete handler
    isOwner,
    currentUserEmail,
    refreshTrigger = 0,
    allClassroomStudents = [],
    teacherEmail = ''
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Merge session attendance with all enrolled students
    const completeAttendance = useMemo(() => {
        const sessionAttendance = session.attendance || [];

        // Create a map of existing attendance records by email (case-insensitive)
        const sessionEmailsMap = new Map();
        sessionAttendance.forEach(record => {
            if (record.studentEmail) {
                sessionEmailsMap.set(record.studentEmail.toLowerCase(), record);
            }
        });

        // Get all students except teacher
        const studentsOnly = allClassroomStudents.filter(
            student => student.email && student.email.toLowerCase() !== teacherEmail.toLowerCase()
        );

        // Create complete attendance list
        const mergedList = studentsOnly.map(student => {
            const emailLower = student.email.toLowerCase();

            // If student has existing attendance record, use it (preserves status)
            if (sessionEmailsMap.has(emailLower)) {
                return sessionEmailsMap.get(emailLower);
            }

            // Otherwise, add as unmarked (new students only)
            return {
                studentEmail: student.email,
                studentName: student.name,
                status: 'unmarked',
                markedAt: null,
                markedBy: null
            };
        });

        console.log('📊 Attendance Merge Debug:', {
            originalRecords: sessionAttendance.length,
            enrolledStudents: studentsOnly.length,
            mergedTotal: mergedList.length,
            existing: mergedList.filter(r => r.status !== 'unmarked').length,
            newUnmarked: mergedList.filter(r => r.status === 'unmarked').length
        });

        return mergedList;
    }, [session.attendance, allClassroomStudents, teacherEmail]);

    // Calculate stats from complete attendance
    const presentCount = completeAttendance.filter(record => record.status === 'present').length;
    const absentCount = completeAttendance.filter(record => record.status === 'absent').length;
    const unmarkedCount = completeAttendance.filter(record => record.status === 'unmarked').length;
    const totalStudents = completeAttendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    // Get current user's attendance status
    const userAttendance = completeAttendance.find(
        record => record.studentEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
    );
    const userStatus = userAttendance?.status || 'unmarked';

    // Handle view details - pass complete attendance
    const handleViewDetails = () => {
        // Pass session with merged attendance to modal
        const sessionWithCompleteAttendance = {
            ...session,
            attendance: completeAttendance
        };
        onViewDetails(sessionWithCompleteAttendance, onSessionUpdate);
    };

    // Handle delete with confirmation
    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!onDeleteSession || typeof onDeleteSession !== 'function') {
            console.error('onDeleteSession prop is required');
            alert('Delete function is not properly configured');
            return;
        }

        // Debug log to verify session ID
        console.log('🔍 Attempting to delete session:', {
            sessionId: session.id,
            sessionIdType: typeof session.id,
            hasId: !!session.id,
            sessionKeys: Object.keys(session)
        });

        setIsDeleting(true);
        try {
            // ✅ CRITICAL FIX: Use session.id instead of session._id
            await onDeleteSession(session.id);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Failed to delete session:', error);
            alert('Failed to delete session. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md relative">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">
                                {session.title}
                            </h3>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {session.description}
                            </p>
                            <div className="flex items-center text-sm text-slate-500">
                                <MdDateRange className="w-4 h-4 mr-1.5 text-slate-400" />
                                <time className="font-medium">
                                    {new Date(session.date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </time>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="ml-4 flex-shrink-0">
                            {isOwner ? (
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${attendancePercentage >= 80 ? 'text-green-600' :
                                        attendancePercentage >= 60 ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                        {attendancePercentage}%
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Attendance</div>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${userStatus === 'present' ? 'bg-green-100 text-green-600' :
                                        userStatus === 'absent' ? 'bg-red-100 text-red-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                        {userStatus === 'present' ? <MdCheckCircle className="w-5 h-5" /> :
                                            userStatus === 'absent' ? <MdCancel className="w-5 h-5" /> :
                                                <MdSchedule className="w-5 h-5" />}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium mt-1 capitalize">
                                        {userStatus}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="px-6 py-4">
                    {isOwner ? (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{presentCount}</div>
                                <div className="text-xs text-slate-600 font-medium">Present</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{absentCount}</div>
                                <div className="text-xs text-slate-600 font-medium">Absent</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-slate-500">{unmarkedCount}</div>
                                <div className="text-xs text-slate-600 font-medium">Unmarked</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center text-sm text-slate-600">
                                <MdPeople className="w-4 h-4 mr-1.5 text-slate-400" />
                                <span>{totalStudents} students in session</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${userStatus === 'present' ? 'bg-green-50 text-green-700 border border-green-200' :
                                userStatus === 'absent' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    'bg-slate-50 text-slate-700 border border-slate-200'
                                }`}>
                                Your Status: {userStatus.charAt(0).toUpperCase() + userStatus.slice(1)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <div className="flex gap-3">
                        <button
                            onClick={handleViewDetails}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
                        >
                            {/* <MdVisibility className="w-4 h-4 mr-2" /> */}
                            {isOwner ? 'Manage Attendance' : 'View Details'}
                        </button>
                        {isOwner && (
                            <button
                                onClick={handleDeleteClick}
                                className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-medium rounded-md border border-red-200 hover:border-red-300 transition-colors duration-200"
                                title="Delete session"
                            >
                                <MdDelete className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Update indicator */}
                {/* {refreshTrigger > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                            Updated ✓
                        </div>
                    </div>
                )} */}
            </div>

            {/* Delete Confirmation Modal with Blurred Backdrop */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-200 scale-100">
                        <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                                <MdDelete className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Delete Attendance Session?
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Are you sure you want to delete <span className="font-semibold text-slate-900">"{session.title}"</span>? This action cannot be undone and will permanently remove all attendance records for this session.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <MdDelete className="w-4 h-4 mr-1.5" />
                                        Delete Session
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


export default AttendanceSessionCard;
