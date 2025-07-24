import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthProvider';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import {
    MdDashboard,
    MdSchool,
    MdTrendingUp,
    MdHome,
    MdClass,
    MdEdit,
    MdLogout,
    MdLocationOn,
    MdEmail,
    MdBusiness,
    MdExpandMore,
    MdExpandLess,
    MdPerson,
    MdAdd  // Add this import
} from 'react-icons/md';
import {
    FaFacebook,
    FaLinkedin,
    FaEnvelope
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logOut } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const location = useLocation();
    const [userData, setUserData] = useState(null);
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    // Fetch user data for additional info
    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.email) {
                try {
                    const response = await axiosPublic.get(`/users/${user.email}`);
                    if (response.data.success) {
                        setUserData(response.data.user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [user?.email, axiosPublic]);

    const mainMenuItems = [
        { name: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
        { name: 'My Classes', icon: MdSchool, path: '/my-classes' },
        { name: 'My Progress', icon: MdTrendingUp, path: '/my-progress' },
    ];

    const classManagementItems = [
        { name: 'Create Class', icon: MdAdd, path: '/create-class' }, // ✅ Added Create Class
    ];

    const secondaryMenuItems = [
        { name: 'Homepage', icon: MdHome, path: '/' },
        { name: 'All Classes', icon: MdClass, path: '/all-classes' },
    ];

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Get combined location string
    const getLocationString = () => {
        if (!userData?.profile) return null;

        const { city, district, country } = userData.profile;

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

    // Check if user has additional info to show
    const hasAdditionalInfo = userData?.profile && (
        userData.profile.mailLink ||
        userData.profile.facebook ||
        userData.profile.linkedin ||
        userData.createdAt
    );

    return (
        <div className="fixed left-0 top-0 h-full w-[320px] bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-2xl z-10 text-gray-700 font-poppins">
            {/* Scrollable Container */}
            <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                {/* Profile Section */}
                <div className="pt-8 pb-6">
                    {/* Profile Image */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] flex items-center justify-center">
                                {userData?.photoURL || user?.photoURL ? (
                                    <img
                                        src={userData?.photoURL || user?.photoURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-2xl font-bold">
                                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* User Name */}
                    <div className="px-6 text-center mb-4">
                        <h3 className="font-bold text-xl text-gray-800 mb-1">
                            {userData?.name || user?.displayName || 'User'}
                        </h3>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 mb-3 px-2 leading-relaxed">
                            {userData?.profile?.bio || "Welcome to EduGrid! Update your bio in profile settings."}
                        </p>

                        {/* Role Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white shadow-sm">
                            {userData?.role === 'user' ? 'Student' : userData?.role || 'Student'}
                        </div>
                    </div>

                    {/* Basic Personal Info (Always Visible) */}
                    {userData && (
                        <div className="px-4 space-y-2">
                            {/* Email (always show) */}
                            <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                <MdEmail className="text-green-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{userData.email}</span>
                            </div>

                            {/* Combined Location */}
                            {getLocationString() && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <MdLocationOn className="text-red-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{getLocationString()}</span>
                                </div>
                            )}

                            {/* Institution */}
                            {userData.profile?.institution && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <MdBusiness className="text-blue-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{userData.profile.institution}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* See More Button */}
                    {hasAdditionalInfo && (
                        <div className="px-4 mt-3">
                            <button
                                onClick={() => setShowMoreInfo(!showMoreInfo)}
                                className="w-full flex items-center justify-center px-3 py-2 text-xs font-medium text-[#457B9D] bg-white/40 rounded-lg hover:bg-white/60 transition-all duration-300 border border-[#457B9D]/10"
                            >
                                {showMoreInfo ? (
                                    <>
                                        <MdExpandLess className="mr-1 text-sm" />
                                        See Less
                                    </>
                                ) : (
                                    <>
                                        <MdExpandMore className="mr-1 text-sm" />
                                        See More
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Extended Personal Info (Collapsible) */}
                    {userData && showMoreInfo && (
                        <div className="px-4 mt-3 space-y-2 animate-fadeIn">
                            {/* Professional Email */}
                            {userData.profile?.mailLink && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <FaEnvelope className="text-purple-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">{userData.profile.mailLink}</span>
                                </div>
                            )}

                            {/* Facebook */}
                            {userData.profile?.facebook && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <FaFacebook className="text-blue-600 mr-2 flex-shrink-0" />
                                    <a
                                        href={userData.profile.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate hover:text-blue-600 transition-colors"
                                    >
                                        Facebook Profile
                                    </a>
                                </div>
                            )}

                            {/* LinkedIn */}
                            {userData.profile?.linkedin && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <FaLinkedin className="text-blue-700 mr-2 flex-shrink-0" />
                                    <a
                                        href={userData.profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="truncate hover:text-blue-700 transition-colors"
                                    >
                                        LinkedIn Profile
                                    </a>
                                </div>
                            )}

                            {/* Joined Date */}
                            {userData.createdAt && (
                                <div className="flex items-center text-xs text-gray-600 bg-white/60 rounded-lg px-3 py-2">
                                    <MdPerson className="text-gray-500 mr-2 flex-shrink-0" />
                                    <span className="truncate">
                                        Joined: {new Date(userData.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Edit Profile Button */}
                <div className="px-6 mb-6">
                    <Link
                        to="/edit-profile"
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#457B9D] bg-white rounded-xl hover:bg-gray-50 transition-all duration-300 border border-[#457B9D]/20 shadow-sm hover:shadow-md group"
                    >
                        <MdEdit className="mr-2 text-lg group-hover:scale-110 transition-transform duration-300" />
                        Edit Profile
                    </Link>
                </div>

                {/* Main Navigation */}
                <div className="px-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-3">
                        Main Menu
                    </h4>
                    <nav className="space-y-1">
                        {mainMenuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-white hover:shadow-md text-gray-700'
                                        }`}
                                >
                                    <IconComponent className={`mr-3 text-lg transition-all duration-300 ${isActive
                                            ? 'text-white'
                                            : 'text-[#457B9D] group-hover:scale-110'
                                        }`} />
                                    {item.name}
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* ✅ Class Management Section */}
                <div className="px-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-3">
                        Class Management
                    </h4>
                    <nav className="space-y-1">
                        {classManagementItems.map((item, index) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-white hover:shadow-md text-gray-700'
                                        }`}
                                >
                                    <IconComponent className={`mr-3 text-lg transition-all duration-300 ${isActive
                                            ? 'text-white'
                                            : 'text-green-500 group-hover:scale-110'
                                        }`} />
                                    {item.name}
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Secondary Navigation */}
                <div className="px-4 mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-3">
                        Explore
                    </h4>
                    <nav className="space-y-1">
                        {secondaryMenuItems.map((item, index) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                                            : 'hover:bg-white hover:shadow-md text-gray-600'
                                        }`}
                                >
                                    <IconComponent className={`mr-3 text-lg transition-all duration-300 ${isActive
                                            ? 'text-white'
                                            : 'text-gray-500 group-hover:scale-110'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Spacer to push logout button to bottom */}
                <div className="flex-grow"></div>

                {/* Logout Button */}
                <div className="px-4 pb-6 mt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 border border-red-200 shadow-sm hover:shadow-md group"
                    >
                        <MdLogout className="mr-2 text-lg group-hover:scale-110 transition-transform duration-300" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#457B9D]/10 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-[#457B9D]/10 to-transparent rounded-tr-full pointer-events-none"></div>
        </div>
    );
};

export default Sidebar;
