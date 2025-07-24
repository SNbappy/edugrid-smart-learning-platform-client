import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    MdPeople,
    MdAssignment,
    MdBook,
    MdGrade,
    MdArrowBack,
    MdCode,
    MdSchedule
} from 'react-icons/md';

const Classroom = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const [classroom, setClassroom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch classroom details
    useEffect(() => {
        const fetchClassroom = async () => {
            if (classroomId) {
                try {
                    const response = await axiosPublic.get(`/classrooms/${classroomId}`);
                    if (response.data.success) {
                        setClassroom(response.data.classroom);
                    }
                } catch (error) {
                    console.error('Error fetching classroom:', error);
                    navigate('/my-classes');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!loading && user) {
            fetchClassroom();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    const classroomOptions = [
        {
            id: 'attendance',
            title: 'Attendance',
            description: 'Track student attendance',
            icon: MdPeople,
            color: 'from-blue-500 to-blue-600',
            path: `/classroom/${classroomId}/attendance`
        },
        {
            id: 'materials',
            title: 'Class Materials',
            description: 'Share and access course materials',
            icon: MdBook,
            color: 'from-green-500 to-green-600',
            path: `/classroom/${classroomId}/materials`
        },
        {
            id: 'tasks',
            title: 'Tasks',
            description: 'Assignments and homework',
            icon: MdAssignment,
            color: 'from-purple-500 to-purple-600',
            path: `/classroom/${classroomId}/tasks`
        },
        {
            id: 'marks',
            title: 'Marks',
            description: 'View grades and assessment results',
            icon: MdGrade,
            color: 'from-orange-500 to-orange-600',
            path: `/classroom/${classroomId}/marks`
        }
    ];

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading classroom...</p>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Classroom Not Found</h2>
                    <button
                        onClick={() => navigate('/my-classes')}
                        className="px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold"
                    >
                        Back to My Classes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>
                    {classroom && classroom.name && typeof classroom.name === 'string'
                        ? `EduGrid | ${classroom.name}`
                        : 'EduGrid | Classroom'
                    }
                </title>
            </Helmet>


            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header with Back Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/my-classes')}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                            >
                                <MdArrowBack className="mr-2" />
                                Back to My Classes
                            </button>
                        </div>

                        {/* Classroom Header */}
                        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] p-8 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-bold mb-2">{classroom.title}</h1>
                                        <p className="text-xl text-white/90 mb-4">{classroom.subject}</p>
                                        <p className="text-white/80">
                                            Teacher: {classroom.teacherName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center mb-4">
                                            <MdCode className="mr-2" />
                                            <span className="bg-white/20 px-4 py-2 rounded-xl font-bold text-lg">
                                                {classroom.classCode}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-white/90">
                                            <MdPeople className="mr-2" />
                                            <span>{classroom.students?.length || 0} Students</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {classroom.description && (
                                <div className="p-6 border-b border-gray-100">
                                    <p className="text-gray-700 text-lg">{classroom.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Classroom Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {classroomOptions.map((option) => {
                                const IconComponent = option.icon;

                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => navigate(option.path)}
                                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                                    >
                                        <div className={`bg-gradient-to-r ${option.color} p-6 text-white`}>
                                            <IconComponent className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300" />
                                            <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-gray-600 mb-4">{option.description}</p>
                                            <div className="flex items-center text-[#457B9D] font-semibold group-hover:text-[#3a6b8a] transition-colors">
                                                <span>Access {option.title}</span>
                                                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Total Students</p>
                                        <p className="text-3xl font-bold text-gray-800">{classroom.students?.length || 0}</p>
                                    </div>
                                    <MdPeople className="text-4xl text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Active Tasks</p>
                                        <p className="text-3xl font-bold text-gray-800">0</p>
                                    </div>
                                    <MdAssignment className="text-4xl text-purple-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">Materials Shared</p>
                                        <p className="text-3xl font-bold text-gray-800">0</p>
                                    </div>
                                    <MdBook className="text-4xl text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Classroom;
