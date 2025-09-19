import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import EditClassroomModal from './EditClassroomModal';
import {
    MdPeople,
    MdAssignment,
    MdBook,
    MdGrade,
    MdArrowBack,
    MdEdit,
    MdSchool,
    MdContentCopy,
    MdCheck
} from 'react-icons/md';

const Classroom = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const [classroom, setClassroom] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    // Check if current user is the classroom owner
    const isClassroomOwner = user && classroom && classroom.teacherEmail === user.email;

    // Copy classroom code function
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(classroom.code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Fetch classroom details
    useEffect(() => {
        const fetchClassroom = async () => {
            if (classroomId) {
                try {
                    console.log('Fetching classroom:', classroomId);
                    const response = await axiosPublic.get(`/classrooms/${classroomId}`);
                    if (response.data.success) {
                        console.log('Classroom data received:', response.data.classroom);
                        setClassroom(response.data.classroom);
                    } else {
                        console.error('Classroom not found');
                        navigate('/my-classes');
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

    // Handle classroom update
    const handleClassroomUpdate = (updatedClassroom) => {
        console.log('Updating classroom state with:', updatedClassroom);
        setClassroom(updatedClassroom);
        setShowEditModal(false);
    };

    // Enhanced classroom options with modern design
    const classroomOptions = [
        {
            id: 'attendance',
            title: 'Attendance',
            icon: MdPeople,
            path: `/classroom/${classroomId}/attendance`,
            iconColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200',
            stats: `${classroom?.students?.length || 0} Students`
        },
        {
            id: 'materials',
            title: 'Materials',
            icon: MdBook,
            path: `/classroom/${classroomId}/materials`,
            iconColor: 'text-teal-600',
            bgColor: 'bg-teal-50',
            borderColor: 'border-teal-200',
            stats: `${(classroom?.materials?.files?.length || 0) + (classroom?.materials?.links?.length || 0) + (classroom?.materials?.videos?.length || 0)} Resources`
        },
        {
            id: 'tasks',
            title: 'Assignments',
            icon: MdAssignment,
            path: `/classroom/${classroomId}/tasks`,
            iconColor: 'text-violet-600',
            bgColor: 'bg-violet-50',
            borderColor: 'border-violet-200',
            stats: `${classroom?.tasks?.assignments?.length || 0} Active Tasks`
        },
        // {
        //     id: 'marks',
        //     title: 'Grade Center',
        //     icon: MdGrade,
        //     path: `/classroom/${classroomId}/marks`,
        //     iconColor: 'text-amber-600',
        //     bgColor: 'bg-amber-50',
        //     borderColor: 'border-amber-200',
        //     stats: 'Grade Analytics'
        // }
    ];

    // Loading state with modern spinner
    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-300 border-t-[#457B9D] mx-auto mb-6"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Loading Classroom</h3>
                    <p className="text-slate-500">Fetching classroom details...</p>
                </div>
            </div>
        );
    }

    // Error state with modern design
    if (!classroom) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-slate-200 max-w-md">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MdSchool className="text-3xl text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-3">Classroom Not Found</h2>
                    <p className="text-slate-600 mb-8">The classroom you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/my-classes')}
                        className="px-6 py-3 bg-[#457B9D] text-white rounded-lg hover:bg-[#3d6b87] transition-colors font-medium"
                    >
                        Back to My Classes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-inter">
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
                    <div className="max-w-6xl mx-auto">
                        {/* Navigation Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/my-classes')}
                                className="flex items-center text-slate-600 hover:text-[#457B9D] transition-colors mb-4 group"
                            >
                                <MdArrowBack className="mr-2 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="font-medium">Back to My Classes</span>
                            </button>
                        </div>

                        {/* Classroom Header */}
                        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="relative h-48 overflow-hidden">
                                {/* Background */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800"
                                    style={{
                                        backgroundImage: classroom.imageUrl
                                            ? `url(${classroom.imageUrl})`
                                            : undefined,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-[#457B9D]/20 to-[#3a6b8a]/20" />

                                {/* Edit Button */}
                                {isClassroomOwner && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="absolute top-4 right-4 bg-white bg-opacity-90 text-slate-700 px-3 py-2 rounded-lg hover:bg-opacity-100 transition-all flex items-center gap-2"
                                    >
                                        <MdEdit className="text-sm" />
                                        <span className="text-sm font-medium">Edit</span>
                                    </button>
                                )}

                                {/* Classroom Info */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6">
                                    {/* Top Right Stats */}
                                    <div className="flex justify-end">
                                        <div className="flex gap-3">
                                            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-center border border-white border-opacity-20">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <MdPeople className="text-sm" />
                                                    <span className="text-sm font-semibold">{classroom.students?.length || 0}</span>
                                                </div>
                                                <div className="text-xs opacity-90">Students</div>
                                            </div>
                                            <div className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-center border border-white border-opacity-20">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <button
                                                        onClick={handleCopyCode}
                                                        className="flex items-center gap-1 hover:bg-white hover:bg-opacity-20 rounded px-1 transition-colors"
                                                    >
                                                        {copiedCode ? (
                                                            <MdCheck className="text-sm text-green-300" />
                                                        ) : (
                                                            <MdContentCopy className="text-sm" />
                                                        )}
                                                        <span className="text-sm font-mono font-semibold">{classroom.code}</span>
                                                    </button>
                                                </div>
                                                <div className="text-xs opacity-90">{copiedCode ? 'Copied!' : 'Code'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Info */}
                                    <div className="max-w-2xl">
                                        <div className="mb-2">
                                            <span className="inline-block px-3 py-1 bg-[#457B9D] bg-opacity-90 text-white text-sm font-medium rounded-full">
                                                {classroom.subject}
                                            </span>
                                        </div>

                                        <h1 className="text-2xl font-bold text-white mb-2 truncate"
                                            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                                            title={classroom.name}
                                        >
                                            {classroom.name}
                                        </h1>

                                        <div className="flex items-center text-white text-sm">
                                            <span className="flex items-center gap-2 truncate"
                                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                                <span>Instructor:</span>
                                                <span className="font-medium truncate" title={classroom.teacherName}>
                                                    {classroom.teacherName}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            {classroom.description && (
                                <div className="p-4 bg-slate-50 border-t">
                                    <p className="text-slate-700 text-sm leading-relaxed">{classroom.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {classroomOptions.map((option) => {
                                const IconComponent = option.icon;

                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => navigate(option.path)}
                                        className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
                                    >
                                        {/* Animated loading bar */}
                                        <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
                                            <div className={`h-full ${option.bgColor.replace('bg-', 'bg-gradient-to-r from-transparent via-')} to-transparent opacity-60 animate-pulse`}></div>
                                        </div>

                                        {/* Header */}
                                        <div className={`${option.bgColor} p-4 relative`}>
                                            <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                                <IconComponent className={`text-lg ${option.iconColor}`} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-2">{option.title}</h3>

                                            {/* Animated loading lines */}
                                            <div className="space-y-2 mb-4">
                                                <div className="h-2 bg-slate-100 rounded animate-pulse"></div>
                                                <div className="h-2 bg-slate-100 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded">
                                                    {option.stats}
                                                </span>
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-[#457B9D] transition-colors">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Statistics Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
                                        <p className="text-2xl font-bold text-slate-800 mb-1">{classroom.students?.length || 0}</p>
                                        <p className="text-xs text-slate-500">Currently enrolled</p>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <MdPeople className="text-lg text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Assignments</p>
                                        <p className="text-2xl font-bold text-slate-800 mb-1">{classroom.tasks?.assignments?.length || 0}</p>
                                        <p className="text-xs text-slate-500">Total created</p>
                                    </div>
                                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                                        <MdAssignment className="text-lg text-violet-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Materials</p>
                                        <p className="text-2xl font-bold text-slate-800 mb-1">
                                            {(classroom.materials?.files?.length || 0) +
                                                (classroom.materials?.links?.length || 0) +
                                                (classroom.materials?.videos?.length || 0)}
                                        </p>
                                        <p className="text-xs text-slate-500">Resources shared</p>
                                    </div>
                                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <MdBook className="text-lg text-teal-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Class Code</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xl font-mono font-bold text-slate-800">{classroom.code}</p>
                                            <button
                                                onClick={handleCopyCode}
                                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                title="Copy class code"
                                            >
                                                {copiedCode ? (
                                                    <MdCheck className="text-sm text-emerald-600" />
                                                ) : (
                                                    <MdContentCopy className="text-sm text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500">Share with students</p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <MdGrade className="text-lg text-amber-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showEditModal && (
                <EditClassroomModal
                    classroom={classroom}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleClassroomUpdate}
                    axiosPublic={axiosPublic}
                />
            )}
        </div>
    );
};

export default Classroom;
