import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    MdAdd,
    MdClass,
    MdPeople,
    MdSchedule,
    MdCode,
    MdLogin,
    MdContentCopy,
    MdSchool,
    MdOpenInNew,
    MdSettings,
    MdExitToApp
} from 'react-icons/md';

const MyClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const [teacherClassrooms, setTeacherClassrooms] = useState([]);
    const [studentClassrooms, setStudentClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'owned', 'enrolled'

    // Fetch user's classrooms (both as teacher and student)
    useEffect(() => {
        const fetchClassrooms = async () => {
            if (user?.email) {
                try {
                    setIsLoading(true);
                    console.log('📚 Fetching all user classrooms for:', user.email);

                    // Fetch classes where user is the teacher
                    const teacherResponse = await axiosPublic.get(`/classrooms/teacher/${user.email}`);

                    // Fetch classes where user is enrolled as student
                    const studentResponse = await axiosPublic.get(`/classrooms/student/${user.email}`);

                    if (teacherResponse.data.success) {
                        setTeacherClassrooms(teacherResponse.data.classrooms || []);
                        console.log('✅ Teacher classrooms:', teacherResponse.data.classrooms);
                    }

                    if (studentResponse.data.success) {
                        setStudentClassrooms(studentResponse.data.classrooms || []);
                        console.log('✅ Student classrooms:', studentResponse.data.classrooms);
                    }

                } catch (error) {
                    console.error('❌ Error fetching classrooms:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to load classrooms. Please try again.'
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!loading && user) {
            fetchClassrooms();
        }
    }, [user, loading, axiosPublic]);

    // Combine and filter classrooms based on active tab
    const getFilteredClassrooms = () => {
        switch (activeTab) {
            case 'owned':
                return teacherClassrooms.map(classroom => ({ ...classroom, userRole: 'teacher' }));
            case 'enrolled':
                return studentClassrooms.map(classroom => ({ ...classroom, userRole: 'student' }));
            case 'all':
            default:
                return [
                    ...teacherClassrooms.map(classroom => ({ ...classroom, userRole: 'teacher' })),
                    ...studentClassrooms.map(classroom => ({ ...classroom, userRole: 'student' }))
                ];
        }
    };

    const filteredClassrooms = getFilteredClassrooms();

    // Create new classroom
    const handleCreateClassroom = async (classroomData) => {
        try {
            console.log('🏗️ Creating classroom with data:', classroomData);

            const response = await axiosPublic.post('/classrooms', {
                name: classroomData.name,
                subject: classroomData.subject,
                description: classroomData.description,
                teacherEmail: user.email,
                teacherName: user.displayName || user.email
            });

            console.log('✅ Classroom creation response:', response.data);

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Classroom Created!',
                    html: `
                        <p><strong>Class Code:</strong></p>
                        <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 18px; margin: 10px 0;">
                            ${response.data.classCode || response.data.classroom?.code}
                        </div>
                        <p style="font-size: 12px; color: #666;">Share this code with students to let them join your class</p>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'Got it!'
                });

                // Refresh teacher classrooms
                const updatedResponse = await axiosPublic.get(`/classrooms/teacher/${user.email}`);
                if (updatedResponse.data.success) {
                    setTeacherClassrooms(updatedResponse.data.classrooms);
                }
            }
        } catch (error) {
            console.error('❌ Error creating classroom:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to create classroom. Please try again.'
            });
        }
    };

    // Join classroom with code
    const handleJoinClassroom = async (classCode) => {
        try {
            console.log('🚪 Joining classroom with code:', classCode);

            const response = await axiosPublic.post('/classrooms/join', {
                classCode: classCode.toUpperCase(),
                studentEmail: user.email,
                studentName: user.displayName || user.email
            });

            console.log('✅ Join response:', response.data);

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Joined Successfully!',
                    text: `Welcome to ${response.data.classroom.name || response.data.classroom.title}`,
                    showConfirmButton: true
                });

                // Refresh student classrooms
                const updatedResponse = await axiosPublic.get(`/classrooms/student/${user.email}`);
                if (updatedResponse.data.success) {
                    setStudentClassrooms(updatedResponse.data.classrooms);
                }
            }
        } catch (error) {
            console.error('❌ Error joining classroom:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to join classroom. Please check the class code and try again.'
            });
        }
    };

    // Leave classroom (for student)
    const handleLeaveClassroom = async (classroom) => {
        const result = await Swal.fire({
            title: `Leave "${classroom.name}"?`,
            text: 'Are you sure you want to leave this classroom? You will need the class code to rejoin.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, leave class'
        });

        if (result.isConfirmed) {
            try {
                await axiosPublic.post(`/classrooms/${classroom._id}/leave`, {
                    studentEmail: user.email
                });

                // Update student classrooms list
                setStudentClassrooms(prev =>
                    prev.filter(c => c._id !== classroom._id)
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Left Successfully!',
                    text: `You have left "${classroom.name}"`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('❌ Error leaving classroom:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to leave classroom. Please try again.'
                });
            }
        }
    };

    // Copy class code to clipboard
    const copyClassCode = async (classCode) => {
        try {
            await navigator.clipboard.writeText(classCode);
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Class code copied to clipboard',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const enterClassroom = (classroomId) => {
        navigate(`/classroom/${classroomId}`);
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading classrooms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | My Classes</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Classes</h1>
                                    <p className="text-lg text-gray-600">Manage and access your classrooms</p>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-lg"
                                    >
                                        <MdLogin className="mr-2 text-lg" />
                                        Join Class
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="flex items-center px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold shadow-lg"
                                    >
                                        <MdAdd className="mr-2 text-lg" />
                                        Create Class
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'all'
                                            ? 'bg-white text-[#457B9D] shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    All Classes ({teacherClassrooms.length + studentClassrooms.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('owned')}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'owned'
                                            ? 'bg-white text-purple-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Owned ({teacherClassrooms.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('enrolled')}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${activeTab === 'enrolled'
                                            ? 'bg-white text-green-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    Enrolled ({studentClassrooms.length})
                                </button>
                            </div>
                        </div>

                        {/* Classrooms Grid */}
                        {filteredClassrooms.length === 0 ? (
                            <div className="text-center py-16">
                                <MdClass className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                                    {activeTab === 'owned' ? 'No Owned Classes' :
                                        activeTab === 'enrolled' ? 'No Enrolled Classes' :
                                            'No Classrooms Yet'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {activeTab === 'owned' ? 'Create your first classroom to get started.' :
                                        activeTab === 'enrolled' ? 'Join a classroom with a class code to get started.' :
                                            'Create your first classroom or join one with a class code'}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    {(activeTab === 'all' || activeTab === 'enrolled') && (
                                        <button
                                            onClick={() => setShowJoinModal(true)}
                                            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                                        >
                                            Join Class
                                        </button>
                                    )}
                                    {(activeTab === 'all' || activeTab === 'owned') && (
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold"
                                        >
                                            Create Class
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClassrooms.map((classroom) => (
                                    <div key={`${classroom._id}-${classroom.userRole}`} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        {/* Classroom Header */}
                                        <div className={`bg-gradient-to-r ${classroom.userRole === 'teacher'
                                                ? 'from-purple-500 to-purple-600'
                                                : 'from-green-500 to-green-600'
                                            } p-6 text-white`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold mb-2">{classroom.name || classroom.title}</h3>
                                                    <p className="text-white/80">{classroom.subject}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    {classroom.userRole === 'teacher' ? (
                                                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                            <MdSchool className="mr-1" />
                                                            Owner
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                                                            <MdLogin className="mr-1" />
                                                            Enrolled
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Class Code Display (only for owned classes) */}
                                            {classroom.userRole === 'teacher' && (classroom.code || classroom.classCode) && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center">
                                                        <MdCode className="mr-2" />
                                                        <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                                                            {classroom.code || classroom.classCode}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyClassCode(classroom.code || classroom.classCode)}
                                                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                                                        title="Copy class code"
                                                    >
                                                        <MdContentCopy className="text-sm" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Classroom Body */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center text-gray-600">
                                                    <MdPeople className="mr-2" />
                                                    <span>{classroom.students?.length || 0} Students</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <MdSchedule className="mr-2" />
                                                    <span>Active</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-6 line-clamp-2">
                                                {classroom.description || 'No description available'}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => enterClassroom(classroom._id)}
                                                    className={`flex-1 ${classroom.userRole === 'teacher'
                                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                                        } text-white py-3 rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center justify-center`}
                                                >
                                                    {classroom.userRole === 'teacher' ? (
                                                        <>
                                                            <MdSettings className="mr-2" />
                                                            Manage Class
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MdOpenInNew className="mr-2" />
                                                            Enter Class
                                                        </>
                                                    )}
                                                </button>

                                                {/* Leave button for enrolled students */}
                                                {classroom.userRole === 'student' && (
                                                    <button
                                                        onClick={() => handleLeaveClassroom(classroom)}
                                                        className="bg-red-100 text-red-700 py-3 px-4 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center"
                                                        title="Leave classroom"
                                                    >
                                                        <MdExitToApp />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Classroom Modal */}
            {showCreateModal && (
                <CreateClassroomModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateClassroom}
                />
            )}

            {/* Join Classroom Modal */}
            {showJoinModal && (
                <JoinClassroomModal
                    onClose={() => setShowJoinModal(false)}
                    onSubmit={handleJoinClassroom}
                />
            )}
        </div>
    );
};

// Create Classroom Modal Component
const CreateClassroomModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.subject) {
            onSubmit(formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Create New Classroom</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Class Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                            placeholder="e.g., Mathematics 101"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                            placeholder="e.g., Mathematics"
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
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                            placeholder="Brief description of the class"
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
                            className="flex-1 px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Join Classroom Modal Component
const JoinClassroomModal = ({ onClose, onSubmit }) => {
    const [classCode, setClassCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (classCode.trim()) {
            onSubmit(classCode.trim().toUpperCase());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Join Classroom</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Class Code *
                        </label>
                        <input
                            type="text"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent text-center text-lg font-mono"
                            placeholder="ABCD12"
                            maxLength="6"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Enter the 6-character code provided by your teacher
                        </p>
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
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                        >
                            Join
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyClasses;
