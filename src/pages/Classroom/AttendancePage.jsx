import { useContext, useState, useEffect } from 'react';
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
    MdCancel,
    MdQuestionMark,
    MdDownload,
    MdDateRange
} from 'react-icons/md';

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
            // For now, we'll simulate the API call
            const newSession = {
                id: Date.now().toString(),
                date: sessionData.date,
                title: sessionData.title,
                description: sessionData.description,
                status: 'active',
                attendance: classroom.students.map(student => ({
                    studentEmail: student.email,
                    studentName: student.name,
                    status: 'unmarked' // present, absent, late, unmarked
                })),
                createdAt: new Date(),
                createdBy: user.email
            };

            setAttendanceSessions([...attendanceSessions, newSession]);
            setShowCreateSession(false);

            Swal.fire('Success!', 'Attendance session created successfully.', 'success');
        } catch (error) {
            console.error('Error creating session:', error);
            Swal.fire('Error!', 'Failed to create attendance session.', 'error');
        }
    };

    // Update attendance for a student
    const updateAttendance = async (sessionId, studentEmail, status) => {
        try {
            const updatedSessions = attendanceSessions.map(session => {
                if (session.id === sessionId) {
                    return {
                        ...session,
                        attendance: session.attendance.map(record =>
                            record.studentEmail === studentEmail
                                ? { ...record, status }
                                : record
                        )
                    };
                }
                return session;
            });

            setAttendanceSessions(updatedSessions);
        } catch (error) {
            console.error('Error updating attendance:', error);
            Swal.fire('Error!', 'Failed to update attendance.', 'error');
        }
    };

    // Calculate attendance statistics
    const getAttendanceStats = () => {
        if (!attendanceSessions.length || !classroom?.students?.length) {
            return { totalSessions: 0, averageAttendance: 0 };
        }

        const totalSessions = attendanceSessions.length;
        const totalPossibleAttendance = totalSessions * classroom.students.length;
        const totalPresent = attendanceSessions.reduce((sum, session) => {
            return sum + session.attendance.filter(record => record.status === 'present').length;
        }, 0);

        return {
            totalSessions,
            averageAttendance: totalPossibleAttendance > 0 ? Math.round((totalPresent / totalPossibleAttendance) * 100) : 0
        };
    };

    const stats = getAttendanceStats();

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
                                        <p className="text-gray-600">Track and manage student attendance</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateSession(true)}
                                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-lg"
                                    >
                                        <MdAdd className="mr-2" />
                                        New Session
                                    </button>
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
                                        <p className="text-sm text-gray-600">Total Students</p>
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
                                        <p className="text-sm text-gray-600">Average Attendance</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageAttendance}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <button className="flex items-center text-purple-600 hover:text-purple-700 transition-colors">
                                    <MdDownload className="mr-2" />
                                    <span className="font-semibold">Export Report</span>
                                </button>
                            </div>
                        </div>

                        {/* Attendance Sessions */}
                        {attendanceSessions.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <MdCalendarToday className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Attendance Sessions</h3>
                                <p className="text-gray-500 mb-6">Create your first attendance session to start tracking student presence.</p>
                                <button
                                    onClick={() => setShowCreateSession(true)}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                                >
                                    Create First Session
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {attendanceSessions.map((session) => (
                                    <AttendanceSessionCard
                                        key={session.id}
                                        session={session}
                                        onUpdateAttendance={updateAttendance}
                                        onViewDetails={() => setSelectedSession(session)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Session Modal */}
            {showCreateSession && (
                <CreateAttendanceModal
                    onClose={() => setShowCreateSession(false)}
                    onSubmit={createAttendanceSession}
                />
            )}

            {/* Session Details Modal */}
            {selectedSession && (
                <SessionDetailsModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                    onUpdateAttendance={updateAttendance}
                />
            )}
        </div>
    );
};

// Attendance Session Card Component
const AttendanceSessionCard = ({ session, onUpdateAttendance, onViewDetails }) => {
    const presentCount = session.attendance.filter(record => record.status === 'present').length;
    const absentCount = session.attendance.filter(record => record.status === 'absent').length;
    const unmarkedCount = session.attendance.filter(record => record.status === 'unmarked').length;
    const totalStudents = session.attendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

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
                    <div className="text-2xl font-bold text-gray-900">{attendancePercentage}%</div>
                    <div className="text-sm text-gray-600">Attendance</div>
                </div>
            </div>

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

            <div className="flex gap-2">
                <button
                    onClick={onViewDetails}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                    Mark Attendance
                </button>
                <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    Export
                </button>
            </div>
        </div>
    );
};

// Create Attendance Modal
const CreateAttendanceModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title && formData.date) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Create Attendance Session</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Session Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Monday Morning Class"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Date *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional description"
                            rows="3"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                        >
                            Create Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Session Details Modal
const SessionDetailsModal = ({ session, onClose, onUpdateAttendance }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <MdCheckCircle className="text-green-500" />;
            case 'absent':
                return <MdCancel className="text-red-500" />;
            case 'late':
                return <MdQuestionMark className="text-yellow-500" />;
            default:
                return <MdQuestionMark className="text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800';
            case 'absent':
                return 'bg-red-100 text-red-800';
            case 'late':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
                </div>

                <div className="space-y-3">
                    {session.attendance.map((record) => (
                        <div key={record.studentEmail} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
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
                                <select
                                    value={record.status}
                                    onChange={(e) => onUpdateAttendance(session.id, record.studentEmail, e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="unmarked">Unmarked</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;
