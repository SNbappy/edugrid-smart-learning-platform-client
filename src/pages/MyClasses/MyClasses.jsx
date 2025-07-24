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
    MdLogin
} from 'react-icons/md';

const MyClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Fetch user's classrooms
    useEffect(() => {
        const fetchClassrooms = async () => {
            if (user?.email) {
                try {
                    const response = await axiosPublic.get(`/classrooms/teacher/${user.email}`);
                    if (response.data.success) {
                        setClassrooms(response.data.classrooms);
                    }
                } catch (error) {
                    console.error('Error fetching classrooms:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!loading && user) {
            fetchClassrooms();
        }
    }, [user, loading, axiosPublic]);

    // Create new classroom
    const handleCreateClassroom = async (classroomData) => {
        try {
            const response = await axiosPublic.post('/classrooms', {
                ...classroomData,
                teacherEmail: user.email,
                teacherName: user.displayName || user.email
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Classroom Created!',
                    text: `Class code: ${response.data.classCode}`,
                    showConfirmButton: true
                });

                // Refresh classrooms
                window.location.reload();
            }
        } catch (error) {
            console.error('Error creating classroom:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to create classroom. Please try again.'
            });
        }
    };

    // Join classroom with code
    const handleJoinClassroom = async (classCode) => {
        try {
            const response = await axiosPublic.post('/classrooms/join', {
                classCode,
                studentEmail: user.email,
                studentName: user.displayName || user.email
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Joined Successfully!',
                    text: `Welcome to ${response.data.classroom.title}`,
                    showConfirmButton: true
                });

                // Refresh page
                window.location.reload();
            }
        } catch (error) {
            console.error('Error joining classroom:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to join classroom.'
            });
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

                        {/* Classrooms Grid */}
                        {classrooms.length === 0 ? (
                            <div className="text-center py-16">
                                <MdClass className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Classrooms Yet</h3>
                                <p className="text-gray-500 mb-6">Create your first classroom or join one with a class code</p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setShowJoinModal(true)}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                                    >
                                        Join Class
                                    </button>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold"
                                    >
                                        Create Class
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classrooms.map((classroom) => (
                                    <div key={classroom._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        {/* Classroom Header */}
                                        <div className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] p-6 text-white">
                                            <h3 className="text-xl font-bold mb-2">{classroom.title}</h3>
                                            <p className="text-white/80">{classroom.subject}</p>
                                            <div className="flex items-center mt-4 text-sm">
                                                <MdCode className="mr-2" />
                                                <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                                                    {classroom.classCode}
                                                </span>
                                            </div>
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

                                            <button
                                                onClick={() => enterClassroom(classroom._id)}
                                                className="w-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white py-3 rounded-xl hover:from-[#3a6b8a] hover:to-[#2d5a73] transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                            >
                                                Enter Classroom
                                            </button>
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
        title: '',
        subject: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title && formData.subject) {
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
                            Class Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            onClose();
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
                            onChange={(e) => setClassCode(e.target.value)}
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
