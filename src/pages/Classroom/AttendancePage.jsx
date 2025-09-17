import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    MdArrowBack,
    MdAdd,
    MdPeople,
    MdCalendarToday,
    MdCheckCircle,
    MdDownload
} from 'react-icons/md';

import AttendanceSessionCard from '../../components/AttendanceSessionCard';
import CreateAttendanceModal from '../../components/CreateAttendanceModal';
import SessionDetailsModal from '../../components/SessionDetailsModal';
import { calculateAttendanceStats } from '../../utils/attendanceUtils';
import { exportAllSessionsPDF } from '../../utils/attendancePDFExport';

const AttendancePage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const [classroom, setClassroom] = useState(null);
    const [attendanceSessions, setAttendanceSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Enhanced owner check function (memoized to prevent infinite re-renders)
    const isOwner = useCallback(() => {
        if (!classroom || !user) return false;

        // Check multiple possible owner/teacher fields
        const possibleOwnerFields = [
            classroom.owner,
            classroom.teacher,
            classroom.instructor,
            classroom.createdBy,
            classroom.teacherEmail
        ];

        // Check if user email matches any owner field (case insensitive)
        const isDirectOwner = possibleOwnerFields.some(field =>
            field && field.toLowerCase().trim() === user.email?.toLowerCase().trim()
        );

        // Check if user is in teachers array (if it exists)
        const isInTeachersArray = classroom.teachers && Array.isArray(classroom.teachers) &&
            classroom.teachers.some(teacher => {
                if (typeof teacher === 'string') {
                    return teacher.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                if (typeof teacher === 'object' && teacher.email) {
                    return teacher.email.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                return false;
            });

        // Check if user is in instructors array (if it exists)
        const isInInstructorsArray = classroom.instructors && Array.isArray(classroom.instructors) &&
            classroom.instructors.some(instructor => {
                if (typeof instructor === 'string') {
                    return instructor.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                if (typeof instructor === 'object' && instructor.email) {
                    return instructor.email.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                return false;
            });

        // Check if user has teacher/owner role in members array
        const hasTeacherRole = classroom.members && Array.isArray(classroom.members) &&
            classroom.members.some(member => {
                const emailMatch = member.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
                    member.userId === user.uid;
                const teacherRoles = ['owner', 'teacher', 'instructor', 'admin'];
                return emailMatch && teacherRoles.includes(member.role?.toLowerCase());
            });

        return isDirectOwner || isInTeachersArray || isInInstructorsArray || hasTeacherRole;
    }, [classroom, user]);

    // Handle export all sessions as PDF
    const handleExportAllSessions = async () => {
        if (attendanceSessions.length === 0) {
            Swal.fire({
                title: 'No Data Available!',
                text: 'No attendance sessions to export.',
                icon: 'warning',
                confirmButtonColor: '#457B9D'
            });
            return;
        }

        setIsExporting(true);

        try {
            // Enhanced stats for PDF
            const enhancedStats = {
                ...stats,
                totalStudents: classroom?.students?.length || 0,
                generatedBy: user?.displayName || user?.email || 'Teacher',
                generatedAt: new Date().toLocaleString()
            };

            const success = exportAllSessionsPDF(
                classroom?.name || 'Classroom',
                attendanceSessions,
                enhancedStats
            );

            if (success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Complete attendance report exported successfully.',
                    icon: 'success',
                    confirmButtonColor: '#457B9D'
                });
            } else {
                throw new Error('PDF generation failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            Swal.fire({
                title: 'Export Failed!',
                text: 'Failed to export attendance report. Please try again.',
                icon: 'error',
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Debug classroom and user data (memoized to prevent infinite re-renders)
    useEffect(() => {
        if (classroom && user && process.env.NODE_ENV === 'development') {
            console.log('=== ATTENDANCE DEBUG INFO ===');
            console.log('Classroom data:', classroom);
            console.log('Current user:', user);
            console.log('Owner check result:', isOwner());
            console.log('=============================');
        }
    }, [classroom, user, isOwner]);

    // Fetch classroom and attendance data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch classroom details
                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);
                    setAttendanceSessions(classroomResponse.data.classroom.attendance?.sessions || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Failed to load attendance data.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // Create new attendance session
    const createAttendanceSession = async (sessionData) => {
        try {
            // Verify ownership before creating
            if (!isOwner()) {
                Swal.fire('Access Denied!', 'Only the classroom teacher can create attendance sessions.', 'error');
                return;
            }

            // Call your backend API
            const response = await axiosPublic.post(`/classrooms/${classroomId}/attendance/sessions`, {
                date: sessionData.date,
                title: sessionData.title,
                description: sessionData.description
            });

            if (response.data.success) {
                // Update local state with the returned session
                setAttendanceSessions([...attendanceSessions, response.data.session]);
                setShowCreateSession(false);
                Swal.fire('Success!', 'Attendance session created successfully.', 'success');
            }
        } catch (error) {
            console.error('Error creating session:', error);
            Swal.fire('Error!', 'Failed to create attendance session.', 'error');
        }
    };

    // Update attendance for a student
    const updateAttendance = async (sessionId, studentEmail, status) => {
        try {
            // Verify ownership before updating
            if (!isOwner()) {
                Swal.fire('Access Denied!', 'Only the classroom teacher can update attendance.', 'error');
                return;
            }

            // Call your backend API
            const response = await axiosPublic.post(`/classrooms/${classroomId}/attendance/sessions/${sessionId}/mark`, {
                studentEmail: studentEmail,
                status: status,
                markedBy: user.email
            });

            if (response.data.success) {
                // Update local state only after successful API call
                const updatedSessions = attendanceSessions.map(session => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            attendance: session.attendance.map(record =>
                                record.studentEmail === studentEmail
                                    ? { ...record, status, markedAt: new Date(), markedBy: user.email }
                                    : record
                            )
                        };
                    }
                    return session;
                });

                setAttendanceSessions(updatedSessions);
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            Swal.fire('Error!', 'Failed to update attendance.', 'error');
        }
    };

    const stats = calculateAttendanceStats(attendanceSessions, classroom, user, isOwner());

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Attendance - {classroom?.name}</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate(`/classroom/${classroomId}`)}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                            >
                                <MdArrowBack className="mr-2" />
                                Back to Classroom
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            Attendance - {classroom?.name}
                                        </h1>
                                        <p className="text-gray-600">
                                            {isOwner() ? 'Track and manage student attendance' : 'View your attendance record'}
                                        </p>
                                        {/* Access level indicator */}
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isOwner()
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {isOwner() ? '👨‍🏫 Teacher Access' : '👨‍🎓 Student View'}
                                            </span>
                                        </div>
                                    </div>
                                    {isOwner() && (
                                        <button
                                            onClick={() => setShowCreateSession(true)}
                                            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-lg"
                                        >
                                            <MdAdd className="mr-2" />
                                            New Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MdPeople className="text-blue-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">
                                            {isOwner() ? 'Total Students' : 'Class Size'}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">{classroom?.students?.length || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <MdCalendarToday className="text-green-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Total Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <MdCheckCircle className="text-yellow-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">
                                            {isOwner() ? 'Average Attendance' : 'Your Attendance'}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
                                    </div>
                                </div>
                            </div>

                            {isOwner() && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <button
                                        onClick={handleExportAllSessions}
                                        disabled={isExporting || attendanceSessions.length === 0}
                                        className="flex items-center text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                                <span className="font-semibold">Exporting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <MdDownload className="mr-2" />
                                                <span className="font-semibold">Export Report</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Attendance Sessions */}
                        {attendanceSessions.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <MdCalendarToday className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Attendance Sessions</h3>
                                <p className="text-gray-500 mb-6">
                                    {isOwner()
                                        ? 'Create your first attendance session to start tracking student presence.'
                                        : 'No attendance sessions have been created yet.'
                                    }
                                </p>
                                {isOwner() && (
                                    <button
                                        onClick={() => setShowCreateSession(true)}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                                    >
                                        Create First Session
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {attendanceSessions.map((session) => (
                                    <AttendanceSessionCard
                                        key={session.id}
                                        session={session}
                                        onUpdateAttendance={updateAttendance}
                                        onViewDetails={() => setSelectedSession(session)}
                                        isOwner={isOwner()}
                                        currentUserEmail={user?.email}
                                        classroomName={classroom?.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isOwner() && showCreateSession && (
                <CreateAttendanceModal
                    onClose={() => setShowCreateSession(false)}
                    onSubmit={createAttendanceSession}
                />
            )}

            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onUpdateAttendance={updateAttendance}
                    isOwner={isOwner()}
                    currentUserEmail={user?.email}
                    classroomName={classroom?.name}
                />
            )}
        </div>
    );
};

export default AttendancePage;
