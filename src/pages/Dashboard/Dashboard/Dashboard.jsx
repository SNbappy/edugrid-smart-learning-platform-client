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
    MdAdd,
    MdBook,
    MdLogin,
    MdEmail,
    MdPerson,
    MdVerified,
    MdEdit,
    MdLocationOn,
    MdBusiness,
    MdCake,
    MdCalendarToday
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
        userData: null
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

                setDashboardData({
                    teachingClasses,
                    enrolledClasses,
                    userData
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
                            <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-6">
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
                                    <div className="w-10 h-10 bg-[#457B9D] rounded-lg flex items-center justify-center">
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
                                        <MdCalendarToday className="w-4 h-4 mr-2 text-slate-500" />
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
                    <div className="max-w-7xl mx-auto px-8 py-12">
                        <div className="space-y-8">
                            {/* Clean User Profile Section */}
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <div className="relative">
                                    {/* Simple Cover Area */}
                                    <div className="h-24 relative overflow-hidden">
                                        {dashboardData.userData?.coverPhotoURL ? (
                                            <>
                                                <img
                                                    src={dashboardData.userData.coverPhotoURL}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/10"></div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-slate-100"></div>
                                        )}

                                        <button
                                            onClick={() => navigate('/edit-profile')}
                                            className="absolute top-4 right-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-slate-700 hover:bg-white text-sm font-medium transition-colors flex items-center space-x-2 shadow-sm"
                                        >
                                            <MdEdit className="w-4 h-4" />
                                            <span>Edit Profile</span>
                                        </button>
                                    </div>

                                    {/* Profile Content */}
                                    <div className="relative px-8 pb-8">
                                        {/* Profile Picture */}
                                        <div className="flex -mt-10 mb-6">
                                            <div className="w-20 h-20 bg-white rounded-lg shadow-sm flex items-center justify-center border-2 border-white overflow-hidden">
                                                {dashboardData.userData?.photoURL || user?.photoURL ? (
                                                    <img
                                                        src={dashboardData.userData?.photoURL || user?.photoURL}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <MdPerson className="w-10 h-10 text-slate-500" />
                                                )}
                                            </div>
                                        </div>

                                        {/* User Info Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Basic Info */}
                                            <div>
                                                <div className="mb-6">
                                                    <h3 className="text-xl font-semibold text-slate-800 flex items-center mb-1">
                                                        {dashboardData.userData?.name || user?.displayName || 'User Name'}
                                                        {user?.emailVerified && (
                                                            <MdVerified className="w-5 h-5 text-blue-600 ml-2" />
                                                        )}
                                                    </h3>
                                                    <p className="text-slate-600">
                                                        {dashboardData.teachingClasses.length > 0 ? 'Educator' : 'Student'}
                                                    </p>
                                                </div>

                                                {/* Bio */}
                                                {dashboardData.userData?.profile?.bio && (
                                                    <div className="mb-6">
                                                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg text-sm">
                                                            {dashboardData.userData.profile.bio}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Simple Stats */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                        <div className="text-xl font-semibold text-slate-800">{dashboardData.teachingClasses.length}</div>
                                                        <div className="text-xs text-slate-600">Teaching</div>
                                                    </div>
                                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                                        <div className="text-xl font-semibold text-slate-800">{dashboardData.enrolledClasses.length}</div>
                                                        <div className="text-xs text-slate-600">Learning</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div>
                                                <h4 className="text-lg font-medium text-slate-800 mb-4">Information</h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex items-center">
                                                        <MdEmail className="w-4 h-4 text-slate-500 mr-3" />
                                                        <div>
                                                            <div className="text-slate-800 font-medium">Email</div>
                                                            <div className="text-slate-600 truncate">{user?.email}</div>
                                                        </div>
                                                    </div>

                                                    {getLocationString() && (
                                                        <div className="flex items-center">
                                                            <MdLocationOn className="w-4 h-4 text-slate-500 mr-3" />
                                                            <div>
                                                                <div className="text-slate-800 font-medium">Location</div>
                                                                <div className="text-slate-600">{getLocationString()}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {dashboardData.userData?.profile?.institution && (
                                                        <div className="flex items-center">
                                                            <MdBusiness className="w-4 h-4 text-slate-500 mr-3" />
                                                            <div>
                                                                <div className="text-slate-800 font-medium">Institution</div>
                                                                <div className="text-slate-600">{dashboardData.userData.profile.institution}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {dashboardData.userData?.createdAt && (
                                                        <div className="flex items-center">
                                                            <MdCake className="w-4 h-4 text-slate-500 mr-3" />
                                                            <div>
                                                                <div className="text-slate-800 font-medium">Joined</div>
                                                                <div className="text-slate-600">
                                                                    {new Date(dashboardData.userData.createdAt).toLocaleDateString('en-US', {
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Social Links */}
                                            <div>
                                                <h4 className="text-lg font-medium text-slate-800 mb-4">Connect</h4>
                                                {(dashboardData.userData?.profile?.facebook || dashboardData.userData?.profile?.linkedin || dashboardData.userData?.profile?.mailLink) ? (
                                                    <div className="space-y-3">
                                                        {dashboardData.userData?.profile?.facebook && (
                                                            <a
                                                                href={dashboardData.userData.profile.facebook}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                                                            >
                                                                <FaFacebook className="w-4 h-4 text-slate-600 mr-3" />
                                                                <span className="text-slate-700">Facebook</span>
                                                            </a>
                                                        )}
                                                        {dashboardData.userData?.profile?.linkedin && (
                                                            <a
                                                                href={dashboardData.userData.profile.linkedin}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                                                            >
                                                                <FaLinkedin className="w-4 h-4 text-slate-600 mr-3" />
                                                                <span className="text-slate-700">LinkedIn</span>
                                                            </a>
                                                        )}
                                                        {dashboardData.userData?.profile?.mailLink && (
                                                            <a
                                                                href={`mailto:${dashboardData.userData.profile.mailLink}`}
                                                                className="flex items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                                                            >
                                                                <FaEnvelope className="w-4 h-4 text-slate-600 mr-3" />
                                                                <span className="text-slate-700">Email</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-slate-500 text-sm">
                                                        <p>No social links added</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simple Quick Actions */}
                            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold text-slate-800 mb-1">Quick Actions</h2>
                                    <p className="text-slate-600 text-sm">Get started with these essential features</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                        <h3 className="font-medium text-slate-800 mb-1">{action.title}</h3>
                                                        <p className="text-sm text-slate-600">{action.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
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
