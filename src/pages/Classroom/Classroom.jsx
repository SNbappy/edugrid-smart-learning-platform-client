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
    MdBarChart,
    MdSettings
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

    // Loading state with modern spinner - following AttendancePage pattern
    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 ml-[320px] flex items-center justify-center">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Classroom</h3>
                            <p className="text-slate-600">Please wait while we fetch your classroom information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state - following AttendancePage pattern
    if (!classroom) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 ml-[320px] flex items-center justify-center">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <MdSchool className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Classroom Not Found</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
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

                <div className="flex-1 ml-[320px]">
                    {/* Professional Header - Following AttendancePage pattern */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-6 sm:px-8">
                            <div className="flex items-center justify-between h-16">
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

                                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                            <MdPeople className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{classroom?.students?.length || 0}</span>
                                            <span className="ml-1">students</span>
                                        </div>

                                        {/* Only show class code for teachers */}
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

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
                        {/* Classroom Header Card */}
                        {(classroom?.imageUrl || classroom?.description) && (
                            <div className="mb-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                {classroom?.imageUrl && (
                                    <div className="relative h-48 overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800"
                                            style={{
                                                backgroundImage: `url(${classroom.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                                            <h2 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                                Welcome to {classroom.name}
                                            </h2>
                                            <p className="text-white/90 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                                Instructor: {classroom.teacherName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {classroom?.description && (
                                    <div className="p-6 bg-slate-50 border-t">
                                        <p className="text-slate-700 leading-relaxed">{classroom.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Professional Stats Grid - Conditional based on role */}
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isClassroomOwner ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
                            {/* Students Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <MdPeople className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">
                                            {classroom?.students?.length || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Students</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Tasks Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <MdAssignment className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">
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
                            <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <MdBook className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">
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

                            {/* Class Code Card - Only visible to teachers */}
                            {isClassroomOwner && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <MdGrade className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <div className="text-lg font-bold text-slate-900 font-mono">
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

                        {/* Classroom Features Section - Following AttendancePage pattern */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">Classroom Features</h2>
                                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                        {classroomOptions.length} modules
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Grid Layout for Features */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {classroomOptions.map((option) => {
                                        const IconComponent = option.icon;

                                        return (
                                            <div
                                                key={option.id}
                                                onClick={() => navigate(option.path)}
                                                className="bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer group p-6"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`w-12 h-12 ${option.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                                        <IconComponent className={`w-6 h-6 ${option.iconColor}`} />
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full bg-slate-300 group-hover:bg-blue-600 flex items-center justify-center transition-colors duration-200">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{option.title}</h3>
                                                <p className="text-sm text-slate-600 mb-4">{option.description}</p>

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
