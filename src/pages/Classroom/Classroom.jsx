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
    MdCheck,
    MdEmail,
    MdLocationOn,
    MdBusiness,
    MdClose,
    MdStar
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
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [membersDetails, setMembersDetails] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const isClassroomOwner = user && classroom && classroom.teacherEmail === user.email;

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(classroom.code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    // Fetch detailed member information
    const fetchMembersDetails = async () => {
        if (!classroom?.students) return;

        setLoadingMembers(true);
        try {
            // Fetch all student details
            const studentPromises = classroom.students.map(studentEmail =>
                axiosPublic.get(`/users/${studentEmail}`).catch(err => {
                    console.error(`Failed to fetch user ${studentEmail}:`, err);
                    return null;
                })
            );

            // Fetch teacher details
            const teacherPromise = axiosPublic.get(`/users/${classroom.teacherEmail}`).catch(err => {
                console.error(`Failed to fetch teacher:`, err);
                return null;
            });

            const responses = await Promise.all([teacherPromise, ...studentPromises]);

            const members = responses
                .filter(response => response && response.data && response.data.success)
                .map(response => ({
                    ...response.data.user,
                    isTeacher: response.data.user.email === classroom.teacherEmail
                }));

            setMembersDetails(members);
        } catch (error) {
            console.error('Error fetching member details:', error);
        } finally {
            setLoadingMembers(false);
        }
    };

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

    const handleClassroomUpdate = (updatedClassroom) => {
        console.log('Updating classroom state with:', updatedClassroom);
        setClassroom(updatedClassroom);
        setShowEditModal(false);
    };

    const handleViewMembers = () => {
        setShowMembersModal(true);
        fetchMembersDetails();
    };

    const classroomOptions = [
        {
            id: 'members',
            title: 'Members',
            icon: MdPeople,
            onClick: handleViewMembers,
            iconColor: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            borderColor: 'border-indigo-200',
            stats: `${(classroom?.students?.length || 0) + 1} People`,
            description: 'View all classroom members'
        },
        {
            id: 'attendance',
            title: 'Attendance',
            icon: MdPeople,
            path: `/classroom/${classroomId}/attendance`,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
            stats: `${classroom?.students?.length || 0} Students`,
            description: 'Track and manage student attendance'
        },
        {
            id: 'materials',
            title: 'Materials',
            icon: MdBook,
            path: `/classroom/${classroomId}/materials`,
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-100',
            borderColor: 'border-emerald-200',
            stats: `${(classroom?.materials?.files?.length || 0) + (classroom?.materials?.links?.length || 0) + (classroom?.materials?.videos?.length || 0)} Resources`,
            description: 'Course materials and resources'
        },
        {
            id: 'tasks',
            title: 'Tasks',
            icon: MdAssignment,
            path: `/classroom/${classroomId}/tasks`,
            iconColor: 'text-purple-600',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-200',
            stats: `${classroom?.tasks?.assignments?.length || 0} Assignments`,
            description: 'Assignments and submissions'
        },
    ];

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
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Classroom</h3>
                            <p className="text-slate-600 text-sm sm:text-base px-4">Please wait while we fetch your classroom information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!classroom) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 lg:ml-[320px] flex items-center justify-center p-4">
                        <div className="text-center py-20 px-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <MdSchool className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Classroom Not Found</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
                                The classroom you're looking for doesn't exist or you don't have access to it.
                            </p>
                            <button
                                onClick={() => navigate('/my-classes')}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-blue-600/25"
                            >
                                <MdArrowBack className="w-4 h-4 mr-2" />
                                Back to My Classes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>
                    {classroom && classroom.name && typeof classroom.name === 'string'
                        ? `${classroom.name} | EduGrid`
                        : 'Classroom | EduGrid'
                    }
                </title>
                <meta name="description" content={`Manage ${classroom?.name} classroom - Materials, Assignments, Attendance and Grades`} />
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 lg:ml-[320px]">
                    {/* Responsive Header */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 lg:z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Mobile Layout */}
                            <div className="lg:hidden py-3 space-y-3">
                                {/* Top Row - Back Button */}
                                <button
                                    onClick={() => navigate('/my-classes')}
                                    className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <MdArrowBack className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>

                                {/* Title Row */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MdSchool className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-base font-bold text-slate-900 truncate">
                                                {classroom?.name}
                                            </h1>
                                            <p className="text-xs text-slate-500 truncate">{classroom?.subject}</p>
                                        </div>
                                    </div>
                                    {isClassroomOwner && (
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="ml-2 p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex-shrink-0"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Stats Row */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${isClassroomOwner
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        {isClassroomOwner ? '👨‍🏫' : '👨‍🎓'}
                                    </span>

                                    <button
                                        onClick={handleViewMembers}
                                        className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                                    >
                                        <MdPeople className="w-3 h-3 mr-1" />
                                        <span className="font-medium">{(classroom?.students?.length || 0) + 1}</span>
                                    </button>

                                    {isClassroomOwner && (
                                        <button
                                            onClick={handleCopyCode}
                                            className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                                        >
                                            {copiedCode ? (
                                                <MdCheck className="w-3 h-3 mr-1 text-emerald-600" />
                                            ) : (
                                                <MdContentCopy className="w-3 h-3 mr-1" />
                                            )}
                                            <span className="font-mono font-medium">{classroom?.code}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-between h-16">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => navigate('/my-classes')}
                                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                                    >
                                        <MdArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="text-sm font-medium">Back to My Classes</span>
                                    </button>

                                    <div className="h-6 w-px bg-slate-300"></div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <MdSchool className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                {classroom?.name}
                                            </h1>
                                            <p className="text-xs text-slate-500 -mt-0.5">{classroom?.subject}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isClassroomOwner
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {isClassroomOwner ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                                        </span>

                                        <button
                                            onClick={handleViewMembers}
                                            className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                                        >
                                            <MdPeople className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{(classroom?.students?.length || 0) + 1}</span>
                                            <span className="ml-1">members</span>
                                        </button>

                                        {isClassroomOwner && (
                                            <button
                                                onClick={handleCopyCode}
                                                className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors"
                                            >
                                                {copiedCode ? (
                                                    <MdCheck className="w-4 h-4 mr-2 text-emerald-600" />
                                                ) : (
                                                    <MdContentCopy className="w-4 h-4 mr-2" />
                                                )}
                                                <span className="font-mono font-medium">{classroom?.code}</span>
                                            </button>
                                        )}
                                    </div>

                                    {isClassroomOwner && (
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-slate-600/25"
                                        >
                                            <MdEdit className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Responsive Padding */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Classroom Header Card - Responsive */}
                        {(classroom?.imageUrl || classroom?.description) && (
                            <div className="mb-6 sm:mb-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                {classroom?.imageUrl && (
                                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800"
                                            style={{
                                                backgroundImage: `url(${classroom.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 sm:p-6">
                                            <h2 className="text-lg sm:text-2xl font-bold text-white mb-1 sm:mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                Welcome to {classroom.name}
                                            </h2>
                                            <p className="text-white/90 text-xs sm:text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                                Instructor: {classroom.teacherName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {classroom?.description && (
                                    <div className="p-4 sm:p-6 bg-slate-50 border-t">
                                        <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{classroom.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Stats Grid - Responsive */}
                        <div className={`grid grid-cols-2 ${isClassroomOwner ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-3 sm:gap-6 mb-6 sm:mb-8`}>
                            {/* Members Card */}
                            <div
                                onClick={handleViewMembers}
                                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <MdPeople className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {(classroom?.students?.length || 0) + 1}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Members</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Tasks Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <MdAssignment className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {classroom?.tasks?.assignments?.length || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Assignments</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((classroom?.tasks?.assignments?.length || 0) / 10) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Materials Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 col-span-2 sm:col-span-1">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <MdBook className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                            {(classroom?.materials?.files?.length || 0) +
                                                (classroom?.materials?.links?.length || 0) +
                                                (classroom?.materials?.videos?.length || 0)}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Materials</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((((classroom?.materials?.files?.length || 0) + (classroom?.materials?.links?.length || 0) + (classroom?.materials?.videos?.length || 0)) / 20) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Class Code Card - Only for teachers */}
                            {isClassroomOwner && (
                                <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 col-span-2 sm:col-span-1">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <MdGrade className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <div className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                                                    {classroom?.code}
                                                </div>
                                                <button
                                                    onClick={handleCopyCode}
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                >
                                                    {copiedCode ? (
                                                        <MdCheck className="w-4 h-4 text-emerald-600" />
                                                    ) : (
                                                        <MdContentCopy className="w-4 h-4 text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium">Class Code</div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-amber-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Features Section - Responsive */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Classroom Features</h2>
                                    <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
                                        {classroomOptions.length} modules
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                                    {classroomOptions.map((option) => {
                                        const IconComponent = option.icon;

                                        return (
                                            <div
                                                key={option.id}
                                                onClick={() => option.onClick ? option.onClick() : navigate(option.path)}
                                                className="bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer group p-4 sm:p-6"
                                            >
                                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${option.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                                        <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${option.iconColor}`} />
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-slate-300 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-200">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{option.title}</h3>
                                                <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">{option.description}</p>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded">
                                                        {option.stats}
                                                    </span>
                                                    <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">
                                                        Open →
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Classroom Modal */}
            {showEditModal && (
                <EditClassroomModal
                    classroom={classroom}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleClassroomUpdate}
                    axiosPublic={axiosPublic}
                />
            )}

            {/* Members Modal */}
            {showMembersModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div
                            className="fixed inset-0 bg-black/50 transition-opacity"
                            onClick={() => setShowMembersModal(false)}
                        ></div>

                        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Classroom Members</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {(classroom?.students?.length || 0) + 1} total members
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <MdClose className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                                {loadingMembers ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-slate-600">Loading members...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {membersDetails.map((member) => (
                                            <div
                                                key={member.email}
                                                className="bg-slate-50 rounded-xl border border-slate-200 p-4 hover:bg-white hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Profile Photo */}
                                                    <div className="relative flex-shrink-0">
                                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                                            {member.photoURL ? (
                                                                <img
                                                                    src={member.photoURL}
                                                                    alt={member.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-white text-xl font-bold">
                                                                    {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {member.isTeacher && (
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                                                                <MdStar className="w-3 h-3 text-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Member Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-base font-semibold text-slate-900 truncate">
                                                                {member.name || 'Unknown User'}
                                                            </h4>
                                                            {member.isTeacher && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                    Teacher
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Email */}
                                                        <div className="flex items-center text-sm text-slate-600 mb-2">
                                                            <MdEmail className="w-4 h-4 mr-2 text-slate-400" />
                                                            <span className="truncate">{member.email}</span>
                                                        </div>

                                                        {/* Institution */}
                                                        {member.profile?.institution && (
                                                            <div className="flex items-center text-sm text-slate-600 mb-2">
                                                                <MdBusiness className="w-4 h-4 mr-2 text-slate-400" />
                                                                <span className="truncate">{member.profile.institution}</span>
                                                            </div>
                                                        )}

                                                        {/* Location */}
                                                        {(member.profile?.country || member.profile?.district || member.profile?.city) && (
                                                            <div className="flex items-center text-sm text-slate-600">
                                                                <MdLocationOn className="w-4 h-4 mr-2 text-slate-400" />
                                                                <span className="truncate">
                                                                    {[member.profile?.city, member.profile?.district, member.profile?.country]
                                                                        .filter(Boolean)
                                                                        .join(', ')}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Bio */}
                                                        {member.profile?.bio && (
                                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                                                {member.profile.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {membersDetails.length === 0 && !loadingMembers && (
                                            <div className="text-center py-12">
                                                <MdPeople className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                                <p className="text-slate-600">No members found</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classroom;
