import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from './Sidebar';
import {
    MdArrowBack,
    MdPerson,
    MdEmail,
    MdLocationOn,
    MdBusiness,
    MdCake,
    MdVerified,
    MdSchool,
    MdBook
} from 'react-icons/md';
import {
    FaFacebook,
    FaLinkedin,
    FaEnvelope
} from 'react-icons/fa';

const PublicProfile = () => {
    const { email } = useParams();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        userData: null,
        teachingClasses: [],
        enrolledClasses: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                setIsLoading(true);

                // Fetch all data in parallel
                const [userResponse, teachingResponse, enrolledResponse] = await Promise.all([
                    axiosPublic.get(`/users/${email}`),
                    axiosPublic.get(`/classrooms/teacher/${email}`),
                    axiosPublic.get(`/classrooms/student/${email}`)
                ]);

                const userData = userResponse.data.success ? userResponse.data.user : null;
                const teachingClasses = teachingResponse.data.success ? teachingResponse.data.classrooms : [];
                const enrolledClasses = enrolledResponse.data.success ? enrolledResponse.data.classrooms : [];

                if (!userData) {
                    navigate('/dashboard');
                    return;
                }

                setProfileData({
                    userData,
                    teachingClasses,
                    enrolledClasses
                });

            } catch (error) {
                console.error('Error fetching public profile:', error);
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        if (email) {
            fetchPublicProfile();
        }
    }, [email, axiosPublic, navigate]);

    // Get combined location string
    const getLocationString = () => {
        if (!profileData.userData?.profile) return null;

        const { city, district, country } = profileData.userData.profile;

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 lg:ml-[320px] flex items-center justify-center p-4">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-[#457B9D]"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Profile</h3>
                            <p className="text-slate-600">Please wait...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const { userData, teachingClasses, enrolledClasses } = profileData;

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>{userData?.name || 'User Profile'} | EduGrid</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 lg:ml-[320px]">
                    {/* Header - Responsive */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 lg:z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Mobile Layout */}
                            <div className="lg:hidden py-3 space-y-3">
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <MdArrowBack className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>

                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#457B9D] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdPerson className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-base font-bold text-slate-800 truncate">
                                            {userData?.name || 'User Profile'}
                                        </h1>
                                        <p className="text-xs text-slate-600">Public Profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-between h-16">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                                    >
                                        <MdArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="text-sm font-medium">Back</span>
                                    </button>

                                    <div className="h-6 w-px bg-slate-300"></div>

                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-[#457B9D] rounded-lg flex items-center justify-center">
                                            <MdPerson className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-800">
                                                {userData?.name || 'User Profile'}
                                            </h1>
                                            <p className="text-slate-600 text-sm -mt-1">Public Profile</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Matching Dashboard Style */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                        <div className="space-y-6 sm:space-y-8">
                            {/* User Profile Section - Exact Dashboard Style */}
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <div className="relative">
                                    {/* Cover Area */}
                                    <div className="h-20 sm:h-24 relative overflow-hidden">
                                        {userData?.coverPhotoURL ? (
                                            <>
                                                <img
                                                    src={userData.coverPhotoURL}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/10"></div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-slate-100"></div>
                                        )}
                                    </div>

                                    {/* Profile Content */}
                                    <div className="relative px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                                        {/* Profile Picture */}
                                        <div className="flex -mt-8 sm:-mt-10 mb-4 sm:mb-6">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg shadow-sm flex items-center justify-center border-2 border-white overflow-hidden">
                                                {userData?.photoURL ? (
                                                    <img
                                                        src={userData.photoURL}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <MdPerson className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                                                )}
                                            </div>
                                        </div>

                                        {/* User Info Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                            {/* Basic Info */}
                                            <div>
                                                <div className="mb-4 sm:mb-6">
                                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center mb-1">
                                                        {userData?.name || 'User Name'}
                                                        {userData?.emailVerified && (
                                                            <MdVerified className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 ml-2" />
                                                        )}
                                                    </h3>
                                                    <p className="text-slate-600 text-sm">
                                                        {teachingClasses.length > 0 ? 'Educator' : 'Student'}
                                                    </p>
                                                </div>

                                                {/* Bio */}
                                                {userData?.profile?.bio && (
                                                    <div className="mb-4 sm:mb-6">
                                                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 sm:p-4 rounded-lg text-xs sm:text-sm">
                                                            {userData.profile.bio}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                                    <div className="text-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-semibold text-slate-800">{teachingClasses.length}</div>
                                                        <div className="text-xs text-slate-600">Teaching</div>
                                                    </div>
                                                    <div className="text-center p-2 sm:p-3 bg-slate-50 rounded-lg">
                                                        <div className="text-lg sm:text-xl font-semibold text-slate-800">{enrolledClasses.length}</div>
                                                        <div className="text-xs text-slate-600">Learning</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div>
                                                <h4 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4">Information</h4>
                                                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                                                    <div className="flex items-start">
                                                        <MdEmail className="w-4 h-4 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
                                                        <div className="min-w-0">
                                                            <div className="text-slate-800 font-medium">Email</div>
                                                            <div className="text-slate-600 truncate">{userData?.email}</div>
                                                        </div>
                                                    </div>

                                                    {getLocationString() && (
                                                        <div className="flex items-start">
                                                            <MdLocationOn className="w-4 h-4 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
                                                            <div className="min-w-0">
                                                                <div className="text-slate-800 font-medium">Location</div>
                                                                <div className="text-slate-600 break-words">{getLocationString()}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {userData?.profile?.institution && (
                                                        <div className="flex items-start">
                                                            <MdBusiness className="w-4 h-4 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
                                                            <div className="min-w-0">
                                                                <div className="text-slate-800 font-medium">Institution</div>
                                                                <div className="text-slate-600 break-words">{userData.profile.institution}</div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {userData?.createdAt && (
                                                        <div className="flex items-start">
                                                            <MdCake className="w-4 h-4 text-slate-500 mr-3 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <div className="text-slate-800 font-medium">Joined</div>
                                                                <div className="text-slate-600">
                                                                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
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
                                                <h4 className="text-base sm:text-lg font-medium text-slate-800 mb-3 sm:mb-4">Connect</h4>
                                                {(userData?.profile?.facebook || userData?.profile?.linkedin || userData?.profile?.mailLink) ? (
                                                    <div className="space-y-2 sm:space-y-3">
                                                        {userData?.profile?.facebook && (
                                                            <a
                                                                href={userData.profile.facebook}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-xs sm:text-sm"
                                                            >
                                                                <FaFacebook className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                                                                <span className="text-slate-700">Facebook</span>
                                                            </a>
                                                        )}
                                                        {userData?.profile?.linkedin && (
                                                            <a
                                                                href={userData.profile.linkedin}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-xs sm:text-sm"
                                                            >
                                                                <FaLinkedin className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                                                                <span className="text-slate-700">LinkedIn</span>
                                                            </a>
                                                        )}
                                                        {userData?.profile?.mailLink && (
                                                            <a
                                                                href={`mailto:${userData.profile.mailLink}`}
                                                                className="flex items-center p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-xs sm:text-sm"
                                                            >
                                                                <FaEnvelope className="w-4 h-4 text-slate-600 mr-3 flex-shrink-0" />
                                                                <span className="text-slate-700">Email</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 sm:py-6 text-slate-500 text-xs sm:text-sm">
                                                        <p>No social links added</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Classes Section */}
                            {(teachingClasses.length > 0 || enrolledClasses.length > 0) && (
                                <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-sm">
                                    <div className="mb-4 sm:mb-6">
                                        <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-1">Classes</h2>
                                        <p className="text-slate-600 text-xs sm:text-sm">Teaching and learning activities</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Teaching Classes */}
                                        {teachingClasses.length > 0 && (
                                            <div>
                                                <h3 className="text-base font-medium text-slate-800 mb-3 flex items-center">
                                                    <MdSchool className="w-5 h-5 mr-2 text-[#457B9D]" />
                                                    Teaching ({teachingClasses.length})
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {teachingClasses.map((cls) => (
                                                        <div
                                                            key={cls._id}
                                                            className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm transition-all"
                                                        >
                                                            <h4 className="font-semibold text-slate-900 mb-1 truncate">{cls.name}</h4>
                                                            <p className="text-sm text-slate-600 truncate">{cls.subject}</p>
                                                            <div className="mt-2 text-xs text-slate-500">
                                                                {cls.students?.length || 0} students
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Enrolled Classes */}
                                        {enrolledClasses.length > 0 && (
                                            <div>
                                                <h3 className="text-base font-medium text-slate-800 mb-3 flex items-center">
                                                    <MdBook className="w-5 h-5 mr-2 text-emerald-600" />
                                                    Enrolled ({enrolledClasses.length})
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {enrolledClasses.map((cls) => (
                                                        <div
                                                            key={cls._id}
                                                            className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm transition-all"
                                                        >
                                                            <h4 className="font-semibold text-slate-900 mb-1 truncate">{cls.name}</h4>
                                                            <p className="text-sm text-slate-600 truncate">{cls.subject}</p>
                                                            <div className="mt-2 text-xs text-slate-500">
                                                                {cls.students?.length || 0} students
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
