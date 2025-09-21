import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from "./Sidebar";
import Swal from 'sweetalert2';
import {
    MdDashboard,
    MdSchool,
    MdPeople,
    MdAssignment,
    MdTrendingUp,
    MdCalendarToday,
    MdAdd,
    MdBook,
    MdAutoAwesome,
    MdLogin,
    MdEmail,
    MdPerson,
    MdVerified,
    MdEdit,
    MdLocationOn,
    MdBusiness,
    MdCake,
    MdAnalytics
} from 'react-icons/md';
import {
    FaFacebook,
    FaLinkedin,
    FaEnvelope
} from 'react-icons/fa';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        teachingClasses: [],
        enrolledClasses: [],
        userData: null,
        stats: {
            totalStudents: 0,
            totalClasses: 0,
            totalAssignments: 0,
            completionRate: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    // Dynamic greeting based on time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.email) return;

            try {
                setIsLoading(true);

                // Fetch all data in parallel
                const [teachingResponse, enrolledResponse, userResponse] = await Promise.all([
                    axiosPublic.get(`/classrooms/teacher/${user.email}`),
                    axiosPublic.get(`/classrooms/student/${user.email}`),
                    axiosPublic.get(`/users/${user.email}`)
                ]);

                const teachingClasses = teachingResponse.data.success ? teachingResponse.data.classrooms : [];
                const enrolledClasses = enrolledResponse.data.success ? enrolledResponse.data.classrooms : [];
                const userData = userResponse.data.success ? userResponse.data.user : null;

                // Calculate stats
                const stats = {
                    totalStudents: teachingClasses.reduce((acc, cls) => acc + (cls.students?.length || 0), 0),
                    totalClasses: teachingClasses.length + enrolledClasses.length,
                    totalAssignments: teachingClasses.reduce((acc, cls) => acc + (cls.tasks?.assignments?.length || 0), 0),
                    completionRate: Math.floor(Math.random() * 25) + 75
                };

                setDashboardData({
                    teachingClasses,
                    enrolledClasses,
                    userData,
                    stats
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user) {
            fetchDashboardData();
        }
    }, [user, loading, axiosPublic]);

    // Handle join classroom
    const handleJoinClass = async () => {
        const { value: classCode } = await Swal.fire({
            title: 'Join a Class',
            text: 'Enter the class code provided by your instructor',
            input: 'text',
            inputPlaceholder: 'Enter class code (e.g., ABC123)',
            showCancelButton: true,
            confirmButtonText: 'Join Class',
            confirmButtonColor: '#457B9D',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter the class code!';
                }
                if (value.length !== 6) {
                    return 'Class code must be 6 characters long!';
                }
            }
        });

        if (classCode) {
            try {
                const response = await axiosPublic.post('/classrooms/join', {
                    classCode: classCode.toUpperCase(),
                    studentEmail: user.email,
                    studentName: user.displayName || user.email
                });

                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Joined Successfully!',
                        text: `Welcome to "${response.data.classroom.name}"`,
                        confirmButtonColor: '#457B9D'
                    });

                    // Refresh data
                    window.location.reload();
                } else {
                    throw new Error(response.data.message || 'Failed to join classroom');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Join Failed!',
                    text: error.response?.data?.message || 'Invalid class code. Please try again.'
                });
            }
        }
    };

    const quickActions = [
        {
            title: 'Create New Class',
            description: 'Set up a new classroom',
            icon: MdAdd,
            action: () => navigate('/create-class')
        },
        {
            title: 'Browse Classes',
            description: 'Discover new courses',
            icon: MdSchool,
            action: () => navigate('/all-classes')
        },
        {
            title: 'My Classes',
            description: 'Manage your classes',
            icon: MdBook,
            action: () => navigate('/my-classes')
        }
    ];

    // Get combined location string
    const getLocationString = () => {
        if (!dashboardData.userData?.profile) return null;

        const { city, district, country } = dashboardData.userData.profile;

        if (city && country) {
            return `${city}, ${country}`;
        } else if (district && country) {
            return `${district}, ${country}`;
        } else if (country) {
            return country;
        } else if (city || district) {
            return city || district;
        }

        return null;
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 ml-[320px] flex items-center justify-center">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#457B9D]"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Dashboard</h3>
                            <p className="text-slate-600">Preparing your workspace...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>EduGrid | Dashboard</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px]">
                    {/* Clean Professional Header */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-[#457B9D] rounded-xl flex items-center justify-center">
                                        <MdDashboard className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-slate-800">
                                            {greeting}, {dashboardData.userData?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}!
                                        </h1>
                                        <p className="text-slate-600 text-sm -mt-1">Welcome back to your dashboard</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="hidden lg:flex items-center text-slate-600 bg-slate-100 px-4 py-2 rounded-lg text-sm">
                                        <MdCalendarToday className="w-4 h-4 mr-2 text-[#457B9D]" />
                                        <span className="font-medium">{new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                    </div>

                                    <button
                                        onClick={handleJoinClass}
                                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <MdLogin className="w-4 h-4 mr-2 inline" />
                                        Join Class
                                    </button>

                                    <button
                                        onClick={() => navigate('/create-class')}
                                        className="px-4 py-2 bg-[#457B9D] hover:bg-[#3a6b8a] text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <MdAdd className="w-4 h-4 mr-2 inline" />
                                        New Class
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-8 py-8">
                        {/* Simple Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <MdSchool className="w-6 h-6 text-[#457B9D]" />
                                    </div>
                                    <MdTrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-slate-800 mb-1">{dashboardData.stats.totalClasses}</div>
                                <div className="text-slate-600 text-sm">Total Classes</div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <MdPeople className="w-6 h-6 text-[#457B9D]" />
                                    </div>
                                    <MdTrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-slate-800 mb-1">{dashboardData.stats.totalStudents}</div>
                                <div className="text-slate-600 text-sm">Students Reached</div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <MdAssignment className="w-6 h-6 text-[#457B9D]" />
                                    </div>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">+12%</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 mb-1">{dashboardData.stats.totalAssignments}</div>
                                <div className="text-slate-600 text-sm">Assignments</div>
                            </div>

                            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <MdAnalytics className="w-6 h-6 text-[#457B9D]" />
                                    </div>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">+8%</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-800 mb-1">{dashboardData.stats.completionRate}%</div>
                                <div className="text-slate-600 text-sm">Success Rate</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Quick Actions */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
                                        <div className="text-slate-400">
                                            <MdAutoAwesome className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {quickActions.map((action, index) => {
                                            const IconComponent = action.icon;
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={action.action}
                                                    className="group p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white hover:shadow-md transition-all"
                                                >
                                                    <div className="flex flex-col items-center text-center space-y-3">
                                                        <div className="w-12 h-12 bg-[#457B9D] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                                            <IconComponent className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
                                                            <p className="text-sm text-slate-600">{action.description}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* User Profile Details */}
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="relative">
                                        {/* UPDATED: Cover photo or gradient background */}
                                        <div className="h-20 relative overflow-hidden">
                                            {dashboardData.userData?.coverPhotoURL ? (
                                                <>
                                                    <img
                                                        src={dashboardData.userData.coverPhotoURL}
                                                        alt="Cover"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a]"></div>
                                            )}

                                            <button
                                                onClick={() => navigate('/edit-profile')}
                                                className="absolute top-4 right-4 p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                                            >
                                                <MdEdit className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Profile Picture */}
                                        <div className="absolute -bottom-8 left-6">
                                            <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-white overflow-hidden">
                                                {dashboardData.userData?.photoURL || user?.photoURL ? (
                                                    <img
                                                        src={dashboardData.userData?.photoURL || user?.photoURL}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <MdPerson className="w-8 h-8 text-slate-600" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Info */}
                                    <div className="pt-12 px-6 pb-6">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                                                {dashboardData.userData?.name || user?.displayName || 'User Name'}
                                                {user?.emailVerified && (
                                                    <MdVerified className="w-4 h-4 text-blue-500 ml-2" />
                                                )}
                                            </h3>
                                            <p className="text-slate-600 text-sm">
                                                {dashboardData.teachingClasses.length > 0 ? 'Educator' : 'Student'}
                                            </p>
                                        </div>

                                        {/* Bio */}
                                        {dashboardData.userData?.profile?.bio && (
                                            <div className="mb-4">
                                                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                                                    {dashboardData.userData.profile.bio}
                                                </p>
                                            </div>
                                        )}

                                        {/* Profile Details */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center text-slate-600">
                                                <MdEmail className="w-4 h-4 mr-3 text-slate-400" />
                                                <span className="truncate">{user?.email}</span>
                                            </div>

                                            {getLocationString() && (
                                                <div className="flex items-center text-slate-600">
                                                    <MdLocationOn className="w-4 h-4 mr-3 text-slate-400" />
                                                    <span>{getLocationString()}</span>
                                                </div>
                                            )}

                                            {dashboardData.userData?.profile?.institution && (
                                                <div className="flex items-center text-slate-600">
                                                    <MdBusiness className="w-4 h-4 mr-3 text-slate-400" />
                                                    <span className="truncate">{dashboardData.userData.profile.institution}</span>
                                                </div>
                                            )}

                                            {dashboardData.userData?.createdAt && (
                                                <div className="flex items-center text-slate-600">
                                                    <MdCake className="w-4 h-4 mr-3 text-slate-400" />
                                                    <span>
                                                        Joined {new Date(dashboardData.userData.createdAt).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Social Links */}
                                        {(dashboardData.userData?.profile?.facebook || dashboardData.userData?.profile?.linkedin || dashboardData.userData?.profile?.mailLink) && (
                                            <div className="mt-6 pt-4 border-t border-slate-200">
                                                <div className="flex space-x-3">
                                                    {dashboardData.userData?.profile?.facebook && (
                                                        <a
                                                            href={dashboardData.userData.profile.facebook}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            <FaFacebook className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {dashboardData.userData?.profile?.linkedin && (
                                                        <a
                                                            href={dashboardData.userData.profile.linkedin}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            <FaLinkedin className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    {dashboardData.userData?.profile?.mailLink && (
                                                        <a
                                                            href={`mailto:${dashboardData.userData.profile.mailLink}`}
                                                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                                                        >
                                                            <FaEnvelope className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Activity Stats */}
                                        <div className="mt-6 pt-4 border-t border-slate-200">
                                            <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <div className="text-xl font-semibold text-slate-800">{dashboardData.teachingClasses.length}</div>
                                                    <div className="text-sm text-slate-600">Teaching</div>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-semibold text-slate-800">{dashboardData.enrolledClasses.length}</div>
                                                    <div className="text-sm text-slate-600">Learning</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
