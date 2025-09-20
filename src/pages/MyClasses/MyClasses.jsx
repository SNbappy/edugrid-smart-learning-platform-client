import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    HiPlus,
    HiAcademicCap,
    HiUsers,
    HiCode,
    HiLogin,
    HiClipboardCopy,
    HiBookOpen,
    HiExternalLink,
    HiCog,
    HiLogout,
    HiStar,
    HiDotsVertical
} from 'react-icons/hi';

const MyClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const [teacherClasses, setTeacherClasses] = useState([]);
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [currentView, setCurrentView] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch user's classroom data
    useEffect(() => {
        const loadUserClassrooms = async () => {
            if (!user?.email) return;

            try {
                setIsLoadingData(true);
                console.log('Loading classrooms for user:', user.email);

                const [teacherRes, studentRes] = await Promise.all([
                    axiosPublic.get(`/classrooms/teacher/${user.email}`),
                    axiosPublic.get(`/classrooms/student/${user.email}`)
                ]);

                if (teacherRes.data.success) {
                    setTeacherClasses(teacherRes.data.classrooms || []);
                }

                if (studentRes.data.success) {
                    setEnrolledClasses(studentRes.data.classrooms || []);
                }

            } catch (error) {
                console.error('Failed to load classrooms:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Unable to load classes',
                    text: 'Please refresh the page and try again.'
                });
            } finally {
                setIsLoadingData(false);
            }
        };

        if (!loading && user) {
            loadUserClassrooms();
        }
    }, [user, loading, axiosPublic]);

    // Get filtered classroom list based on current view and search
    const getDisplayedClasses = () => {
        let classes = [];

        switch (currentView) {
            case 'teaching':
                classes = teacherClasses.map(cls => ({ ...cls, role: 'instructor' }));
                break;
            case 'enrolled':
                classes = enrolledClasses.map(cls => ({ ...cls, role: 'student' }));
                break;
            default:
                classes = [
                    ...teacherClasses.map(cls => ({ ...cls, role: 'instructor' })),
                    ...enrolledClasses.map(cls => ({ ...cls, role: 'student' }))
                ];
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            classes = classes.filter(cls =>
                cls.name?.toLowerCase().includes(search) ||
                cls.subject?.toLowerCase().includes(search) ||
                cls.description?.toLowerCase().includes(search)
            );
        }

        return classes;
    };

    const displayedClasses = getDisplayedClasses();

    // Navigate to create class page
    const handleCreateClass = () => {
        navigate('/create-class');
    };

    // Join a classroom using class code
    const joinWithClassCode = async (classCode) => {
        try {
            const response = await axiosPublic.post('/classrooms/join', {
                classCode: classCode.trim().toUpperCase(),
                studentEmail: user.email,
                studentName: user.displayName || user.email.split('@')[0]
            });

            if (response.data.success) {
                const className = response.data.classroom.name || response.data.classroom.title;

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome to the class!',
                    text: `Successfully joined "${className}"`,
                    confirmButtonColor: '#10B981'
                });

                // Refresh enrolled classes
                const updatedRes = await axiosPublic.get(`/classrooms/student/${user.email}`);
                if (updatedRes.data.success) {
                    setEnrolledClasses(updatedRes.data.classrooms);
                }
            }
        } catch (error) {
            console.error('Join classroom failed:', error);
            Swal.fire({
                icon: 'error',
                title: 'Unable to Join',
                text: error.response?.data?.message || 'Invalid class code. Please check and try again.'
            });
        }
    };

    // Leave a classroom
    const leaveClassroom = async (classroom) => {
        const confirmation = await Swal.fire({
            title: 'Leave Classroom?',
            text: `Are you sure you want to leave "${classroom.name}"? You'll need the class code to rejoin.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, leave classroom',
            cancelButtonText: 'Cancel'
        });

        if (confirmation.isConfirmed) {
            try {
                await axiosPublic.post(`/classrooms/${classroom._id}/leave`, {
                    studentEmail: user.email
                });

                setEnrolledClasses(prev => prev.filter(c => c._id !== classroom._id));

                Swal.fire({
                    icon: 'success',
                    title: 'Left classroom',
                    text: `You have left "${classroom.name}"`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Leave classroom failed:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Unable to leave',
                    text: 'Please try again later.'
                });
            }
        }
    };

    // Copy class code to clipboard
    const copyToClipboard = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            Swal.fire({
                icon: 'success',
                title: 'Code Copied!',
                text: 'Class code has been copied to your clipboard',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const navigateToClassroom = (classId) => {
        navigate(`/classroom/${classId}`);
    };

    if (loading || isLoadingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D] mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading your classrooms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>My Classes - EduGrid</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Header */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-bold text-gray-900">My Classrooms</h1>
                                    <p className="text-gray-600">Manage your teaching and enrolled classes</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowJoinForm(true)}
                                        className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        <HiLogin className="w-4 h-4 mr-2" />
                                        Join Class
                                    </button>
                                    <button
                                        onClick={handleCreateClass}
                                        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-lg hover:from-[#3a6b8a] hover:to-[#2d5a73] transition-all font-medium shadow-sm"
                                    >
                                        <HiPlus className="w-4 h-4 mr-2" />
                                        New Classroom
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filter and Search */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                {/* View Tabs */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setCurrentView('overview')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'overview'
                                            ? 'bg-white text-[#457B9D] shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        All ({teacherClasses.length + enrolledClasses.length})
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('teaching')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'teaching'
                                            ? 'bg-white text-purple-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Teaching ({teacherClasses.length})
                                    </button>
                                    <button
                                        onClick={() => setCurrentView('enrolled')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'enrolled'
                                            ? 'bg-white text-green-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Enrolled ({enrolledClasses.length})
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search classrooms..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent w-64"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Classroom Grid */}
                        {displayedClasses.length === 0 ? (
                            <EmptyState
                                currentView={currentView}
                                searchTerm={searchTerm}
                                onCreateClick={handleCreateClass}
                                onJoinClick={() => setShowJoinForm(true)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                                {displayedClasses.map((classroom) => (
                                    <ClassroomCard
                                        key={`${classroom._id}-${classroom.role}`}
                                        classroom={classroom}
                                        onEnter={() => navigateToClassroom(classroom._id)}
                                        onLeave={() => leaveClassroom(classroom)}
                                        onCopyCode={() => copyToClipboard(classroom.code || classroom.classCode)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Join Class Modal - Only keep the join modal */}
            {showJoinForm && (
                <JoinClassModal
                    onClose={() => setShowJoinForm(false)}
                    onSubmit={joinWithClassCode}
                />
            )}
        </div>
    );
};

// Empty State Component
const EmptyState = ({ currentView, searchTerm, onCreateClick, onJoinClick }) => {
    if (searchTerm) {
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No classrooms found</h3>
                <p className="text-gray-600">No results match "{searchTerm}". Try a different search term.</p>
            </div>
        );
    }

    const getEmptyStateContent = () => {
        switch (currentView) {
            case 'teaching':
                return {
                    icon: HiAcademicCap,
                    title: 'No teaching assignments yet',
                    description: 'Create your first classroom to start teaching and sharing knowledge with students.',
                    action: { text: 'Create Classroom', onClick: onCreateClick, color: 'theme' }
                };
            case 'enrolled':
                return {
                    icon: HiBookOpen,
                    title: 'Not enrolled in any classes',
                    description: 'Ask your instructor for a class code to join your first classroom.',
                    action: { text: 'Join Class', onClick: onJoinClick, color: 'green' }
                };
            default:
                return {
                    icon: HiAcademicCap,
                    title: 'Welcome to EduGrid',
                    description: 'Start by creating a classroom to teach, or join an existing one as a student.',
                    actions: [
                        { text: 'Create Classroom', onClick: onCreateClick, color: 'theme' },
                        { text: 'Join Class', onClick: onJoinClick, color: 'green' }
                    ]
                };
        }
    };

    const { icon: Icon, title, description, action, actions } = getEmptyStateContent();

    return (
        <div className="text-center py-16">
            <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
            <div className="flex gap-3 justify-center">
                {action && (
                    <button
                        onClick={action.onClick}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${action.color === 'theme'
                            ? 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white hover:from-[#3a6b8a] hover:to-[#2d5a73]'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {action.text}
                    </button>
                )}
                {actions && actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={action.onClick}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${action.color === 'theme'
                            ? 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white hover:from-[#3a6b8a] hover:to-[#2d5a73]'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {action.text}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Updated Classroom Card Component with Dynamic Image Support
const ClassroomCard = ({ classroom, onEnter, onLeave, onCopyCode }) => {
    const isInstructor = classroom.role === 'instructor';

    // Array of beautiful education-themed background images (fallback only)
    const backgroundImages = [
        'https://images.unsplash.com/photo-1523580494863-6f436d47d1b9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    ];

    // Use actual classroom image or fallback to generated background
    const getBackgroundImage = () => {
        // Priority 1: Use uploaded classroom image if available
        if (classroom.imageUrl) {
            return classroom.imageUrl;
        }

        // Priority 2: Fallback to consistent generated background
        if (classroom._id) {
            const index = classroom._id.slice(-1).charCodeAt(0) % backgroundImages.length;
            return backgroundImages[index];
        }

        // Priority 3: Default fallback
        return backgroundImages[0];
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
            {/* Header with Background Image - FIXED HEIGHT FOR CONSISTENCY */}
            <div
                className="relative p-6 text-white h-[160px] flex flex-col justify-between"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.4) 100%), url(${getBackgroundImage()})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Role-based accent */}
                <div className={`absolute top-0 left-0 w-full h-1 ${isInstructor ? 'bg-[#457B9D]' : 'bg-green-500'
                    }`}></div>

                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold truncate mb-1 text-white drop-shadow-md">
                            {classroom.name || classroom.title}
                        </h3>
                        <p className="text-white/90 text-sm drop-shadow-sm">{classroom.subject}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${isInstructor
                        ? 'bg-[#457B9D]/20 text-white border border-[#457B9D]/30'
                        : 'bg-green-500/20 text-white border border-green-300/30'
                        }`}>
                        {isInstructor ? (
                            <>
                                <HiStar className="w-3 h-3 mr-1" />
                                Instructor
                            </>
                        ) : (
                            <>
                                <HiBookOpen className="w-3 h-3 mr-1" />
                                Student
                            </>
                        )}
                    </span>
                </div>

                {/* Class Code for instructors - Fixed positioning */}
                {isInstructor && (classroom.code || classroom.classCode) && (
                    <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10 mt-auto">
                        <div className="flex items-center">
                            <HiCode className="w-4 h-4 mr-2 text-white" />
                            <span className="font-mono font-medium text-white">
                                {classroom.code || classroom.classCode}
                            </span>
                        </div>
                        <button
                            onClick={onCopyCode}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-white"
                            title="Copy class code"
                        >
                            <HiClipboardCopy className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Body - FLEXIBLE HEIGHT */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <HiUsers className="w-4 h-4 mr-1" />
                        <span>{classroom.students?.length || 0} students</span>
                    </div>
                </div>

                {/* Description with consistent height */}
                <div className="flex-1 mb-6">
                    {classroom.description ? (
                        <p className="text-gray-700 text-sm line-clamp-3">
                            {classroom.description}
                        </p>
                    ) : (
                        <p className="text-gray-500 text-sm italic">No description available</p>
                    )}
                </div>

                {/* Actions - Always at bottom */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={onEnter}
                        className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-all ${isInstructor
                            ? 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] hover:from-[#3a6b8a] hover:to-[#2d5a73] text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {isInstructor ? (
                            <>
                                <HiCog className="w-4 h-4 mr-2" />
                                Manage
                            </>
                        ) : (
                            <>
                                <HiExternalLink className="w-4 h-4 mr-2" />
                                Enter
                            </>
                        )}
                    </button>

                    {!isInstructor && (
                        <button
                            onClick={onLeave}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Leave classroom"
                        >
                            <HiLogout className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Join Classroom Modal (keeping only this modal)
const JoinClassModal = ({ onClose, onSubmit }) => {
    const [classCode, setClassCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!classCode.trim()) return;

        setIsSubmitting(true);
        await onSubmit(classCode);
        setIsSubmitting(false);
        onClose();
    };

    const handleCodeChange = (value) => {
        // Convert to uppercase and limit to 6 characters
        const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        setClassCode(formatted);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>

                <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Join Classroom</h3>
                        <p className="mt-1 text-sm text-gray-600">Enter the class code provided by your instructor</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class Code *
                            </label>
                            <input
                                type="text"
                                value={classCode}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                                placeholder="ABC123"
                                maxLength={6}
                                required
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                Class codes are 6 characters (letters and numbers)
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !classCode.trim()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? 'Joining...' : 'Join Classroom'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MyClasses;
