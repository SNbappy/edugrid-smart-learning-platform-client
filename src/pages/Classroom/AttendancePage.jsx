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
    MdTrendingUp,
    MdFileDownload,
    MdSchool,
    MdBarChart
} from 'react-icons/md';

import AttendanceSessionCard from '../../components/AttendanceSessionCard';
import CreateAttendanceModal from '../../components/CreateAttendanceModal';
import SessionDetailsModal from '../../components/SessionDetailsModal';
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
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const isOwner = useCallback(() => {
        if (!classroom || !user) return false;

        const possibleOwnerFields = [
            classroom.owner,
            classroom.teacher,
            classroom.instructor,
            classroom.createdBy,
            classroom.teacherEmail
        ];

        const isDirectOwner = possibleOwnerFields.some(field =>
            field && field.toLowerCase().trim() === user.email?.toLowerCase().trim()
        );

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

        const hasTeacherRole = classroom.members && Array.isArray(classroom.members) &&
            classroom.members.some(member => {
                const emailMatch = member.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
                    member.userId === user.uid;
                const teacherRoles = ['owner', 'teacher', 'instructor', 'admin'];
                return emailMatch && teacherRoles.includes(member.role?.toLowerCase());
            });

        return isDirectOwner || isInTeachersArray || isInInstructorsArray || hasTeacherRole;
    }, [classroom, user]);

    const calculateRealAttendanceStats = useCallback(() => {
        if (!attendanceSessions || attendanceSessions.length === 0) {
            return {
                totalSessions: 0,
                totalStudents: classroom?.students?.length || 0,
                averageAttendance: 0,
                totalPossibleAttendance: 0,
                totalActualAttendance: 0
            };
        }

        const totalSessions = attendanceSessions.length;

        if (isOwner()) {
            let totalPossible = 0;
            let totalPresent = 0;

            attendanceSessions.forEach(session => {
                if (session.attendance && Array.isArray(session.attendance)) {
                    totalPossible += session.attendance.length;
                    const presentCount = session.attendance.filter(
                        record => record.status === 'present'
                    ).length;
                    totalPresent += presentCount;
                }
            });

            const averageAttendance = totalPossible > 0
                ? Math.round((totalPresent / totalPossible) * 100)
                : 0;

            return {
                totalSessions,
                totalStudents: classroom?.students?.length || 0,
                averageAttendance,
                totalPossibleAttendance: totalPossible,
                totalActualAttendance: totalPresent
            };
        } else {
            if (!user?.email) {
                return {
                    totalSessions,
                    totalStudents: classroom?.students?.length || 0,
                    averageAttendance: 0,
                    totalPossibleAttendance: 0,
                    totalActualAttendance: 0
                };
            }

            let studentPossible = 0;
            let studentPresent = 0;

            attendanceSessions.forEach(session => {
                if (session.attendance && Array.isArray(session.attendance)) {
                    const studentRecord = session.attendance.find(
                        record => record.studentEmail?.toLowerCase() === user.email.toLowerCase()
                    );

                    if (studentRecord) {
                        studentPossible += 1;
                        if (studentRecord.status === 'present') {
                            studentPresent += 1;
                        }
                    }
                }
            });

            const averageAttendance = studentPossible > 0
                ? Math.round((studentPresent / studentPossible) * 100)
                : 0;

            return {
                totalSessions,
                totalStudents: classroom?.students?.length || 0,
                averageAttendance,
                totalPossibleAttendance: studentPossible,
                totalActualAttendance: studentPresent
            };
        }
    }, [attendanceSessions, classroom, user, isOwner]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);
                    setAttendanceSessions(classroomResponse.data.classroom.attendance?.sessions || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to load attendance data.',
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    const updateAttendance = async (sessionId, studentEmail, status) => {
        try {
            if (!isOwner()) {
                Swal.fire({
                    title: 'Access Denied!',
                    text: 'Only the classroom teacher can update attendance.',
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                return false;
            }

            Swal.fire({
                title: 'Updating...',
                text: 'Please wait while we update the attendance.',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await axiosPublic.post(`/classrooms/${classroomId}/attendance/sessions/${sessionId}/mark`, {
                studentEmail: studentEmail,
                status: status,
                markedBy: user.email
            });

            if (response.data.success) {
                setAttendanceSessions(prevSessions =>
                    prevSessions.map(session => {
                        if (session.id === sessionId) {
                            return {
                                ...session,
                                attendance: session.attendance.map(record =>
                                    record.studentEmail === studentEmail
                                        ? {
                                            ...record,
                                            status,
                                            markedAt: new Date().toISOString(),
                                            markedBy: user.email
                                        }
                                        : record
                                )
                            };
                        }
                        return session;
                    })
                );

                if (selectedSession && selectedSession.id === sessionId) {
                    setSelectedSession(prevSession => ({
                        ...prevSession,
                        attendance: prevSession.attendance.map(record =>
                            record.studentEmail === studentEmail
                                ? {
                                    ...record,
                                    status,
                                    markedAt: new Date().toISOString(),
                                    markedBy: user.email
                                }
                                : record
                        )
                    }));
                }

                setUpdateTrigger(prev => prev + 1);

                Swal.fire({
                    title: 'Success!',
                    text: `Attendance marked as ${status}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                return true;
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to update attendance.',
                icon: 'error',
                confirmButtonColor: '#3B82F6',
            });
            return false;
        }
    };

    const handleSessionDetailsClose = (updatedSession = null) => {
        if (updatedSession) {
            setAttendanceSessions(prevSessions =>
                prevSessions.map(session =>
                    session.id === updatedSession.id ? updatedSession : session
                )
            );
            setUpdateTrigger(prev => prev + 1);
        }
        setSelectedSession(null);
    };

    const handleViewSessionDetails = (session) => {
        const latestSession = attendanceSessions.find(s => s.id === session.id) || session;
        setSelectedSession(latestSession);
    };

    const createAttendanceSession = async (sessionData) => {
        try {
            if (!isOwner()) {
                Swal.fire({
                    title: 'Access Denied!',
                    text: 'Only the classroom teacher can create attendance sessions.',
                    icon: 'error',
                    confirmButtonColor: '#3B82F6',
                });
                return;
            }

            const response = await axiosPublic.post(`/classrooms/${classroomId}/attendance/sessions`, {
                date: sessionData.date,
                title: sessionData.title,
                description: sessionData.description
            });

            if (response.data.success) {
                setAttendanceSessions(prevSessions => [...prevSessions, response.data.session]);
                setShowCreateSession(false);
                setUpdateTrigger(prev => prev + 1);

                Swal.fire({
                    title: 'Success!',
                    text: 'Attendance session created successfully.',
                    icon: 'success',
                    confirmButtonColor: '#3B82F6',
                });
            }
        } catch (error) {
            console.error('Error creating session:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to create attendance session.',
                icon: 'error',
                confirmButtonColor: '#3B82F6',
            });
        }
    };

    const handleExportAllSessions = async () => {
        const stats = calculateRealAttendanceStats();

        if (attendanceSessions.length === 0) {
            Swal.fire({
                title: 'No Data Available!',
                text: 'No attendance sessions to export.',
                icon: 'warning',
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        setIsExporting(true);

        try {
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
                    confirmButtonColor: '#3B82F6',
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
                confirmButtonColor: '#3B82F6',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const stats = calculateRealAttendanceStats();

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 lg:ml-[320px] flex items-center justify-center p-4">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Attendance Data</h3>
                            <p className="text-slate-600 text-sm sm:text-base px-4">Please wait while we fetch your classroom information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-black">
            <Helmet>
                <title>Attendance - {classroom?.name} | EduGrid</title>
                <meta name="description" content={`Manage attendance for ${classroom?.name} classroom`} />
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 lg:ml-[320px]">
                    {/* Responsive Header */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 lg:z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Mobile Layout */}
                            <div className="lg:hidden py-3 space-y-3">
                                <button
                                    onClick={() => navigate(`/classroom/${classroomId}`)}
                                    className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <MdArrowBack className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>

                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdBarChart className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-base font-bold text-slate-900 truncate">
                                            {classroom?.name}
                                        </h1>
                                        <p className="text-xs text-slate-500 truncate">Attendance</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${isOwner()
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        {isOwner() ? '👨‍🏫' : '👨‍🎓'}
                                    </span>

                                    <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                        <MdPeople className="w-3 h-3 mr-1" />
                                        <span className="font-medium">{classroom?.students?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-between h-16">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => navigate(`/classroom/${classroomId}`)}
                                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                                    >
                                        <MdArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="text-sm font-medium">Back to Classroom</span>
                                    </button>

                                    <div className="h-6 w-px bg-slate-300"></div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <MdBarChart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                {classroom?.name}
                                            </h1>
                                            <p className="text-xs text-slate-500 -mt-0.5">Attendance Management</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isOwner()
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {isOwner() ? '👨‍🏫 Teacher Access' : '👨‍🎓 Student View'}
                                        </span>

                                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                            <MdPeople className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{classroom?.students?.length || 0}</span>
                                            <span className="ml-1">students</span>
                                        </div>
                                    </div>

                                    {isOwner() && (
                                        <button
                                            onClick={() => setShowCreateSession(true)}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-600/25"
                                        >
                                            <MdAdd className="w-4 h-4 mr-2" />
                                            New Session
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Responsive */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Mobile New Session Button - Below Navbar */}
                        {isOwner() && (
                            <div className="lg:hidden mb-6">
                                <button
                                    onClick={() => setShowCreateSession(true)}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-600/25"
                                >
                                    <MdAdd className="w-5 h-5 mr-2" />
                                    Create New Session
                                </button>
                            </div>
                        )}

                        {/* Stats Grid - Responsive */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                            {/* Total Students Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <MdSchool className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {classroom?.students?.length || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            {isOwner() ? 'Students' : 'Class Size'}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Total Sessions Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <MdCalendarToday className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {stats.totalSessions}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Sessions</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.totalSessions / 20) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Attendance Rate Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 col-span-2 sm:col-span-1">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <MdTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xl sm:text-2xl font-bold ${stats.averageAttendance >= 80 ? 'text-emerald-600' :
                                            stats.averageAttendance >= 60 ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {stats.averageAttendance}%
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                            {isOwner() ? 'Average' : 'Your Rate'}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${stats.averageAttendance >= 80 ? 'bg-emerald-600' :
                                            stats.averageAttendance >= 60 ? 'bg-amber-600' : 'bg-red-600'
                                            }`}
                                        style={{ width: `${stats.averageAttendance}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Export Report Card - Only for Teachers */}
                            {isOwner() && (
                                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 col-span-2 sm:col-span-1">
                                    <button
                                        onClick={handleExportAllSessions}
                                        disabled={isExporting || attendanceSessions.length === 0}
                                        className="w-full h-full flex flex-col items-center justify-center text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
                                            {isExporting ? (
                                                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-purple-600"></div>
                                            ) : (
                                                <MdFileDownload className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                            )}
                                        </div>
                                        <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                                            {isExporting ? 'Exporting...' : 'Export'}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {isExporting ? 'Wait' : 'PDF'}
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sessions Section - Responsive */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Attendance Sessions</h2>
                                    {attendanceSessions.length > 0 && (
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
                                                {attendanceSessions.length} session{attendanceSessions.length !== 1 ? 's' : ''}
                                            </span>
                                            {isOwner() && stats.totalPossibleAttendance > 0 && (
                                                <span className="text-xs text-slate-500 hidden sm:inline">
                                                    {stats.totalActualAttendance}/{stats.totalPossibleAttendance} total
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {attendanceSessions.length === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <MdCalendarToday className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">No Attendance Sessions Yet</h3>
                                        <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                                            {isOwner()
                                                ? 'Start tracking student attendance by creating your first session.'
                                                : 'Your teacher hasn\'t created any attendance sessions yet.'
                                            }
                                        </p>
                                        {isOwner() && (
                                            <button
                                                onClick={() => setShowCreateSession(true)}
                                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-600/25"
                                            >
                                                <MdAdd className="w-4 h-4 mr-2" />
                                                Create First Session
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                        {attendanceSessions.map((session) => (
                                            <AttendanceSessionCard
                                                key={`${session.id}-${updateTrigger}`}
                                                session={session}
                                                onUpdateAttendance={updateAttendance}
                                                onViewDetails={handleViewSessionDetails}
                                                isOwner={isOwner()}
                                                currentUserEmail={user?.email}
                                                classroomName={classroom?.name}
                                                allClassroomStudents={classroom?.students || []} // ✅ NEW: Pass all students
                                                teacherEmail={classroom?.teacherEmail} // ✅ NEW: Pass teacher email
                                                refreshTrigger={updateTrigger}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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
                    onClose={handleSessionDetailsClose}
                    onUpdateAttendance={updateAttendance}
                    isOwner={isOwner()}
                    currentUserEmail={user?.email}
                    classroomName={classroom?.name}
                    allClassroomStudents={classroom?.students || []} // ✅ NEW: Pass to modal too
                    teacherEmail={classroom?.teacherEmail} // ✅ NEW: Pass to modal too
                />
            )}
        </div>
    );
};

export default AttendancePage;
