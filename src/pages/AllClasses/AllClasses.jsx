import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import {
    MdSearch,
    MdFilterList,
    MdSchool,
    MdPeople,
    MdCalendarToday,
    MdJoinInner,
    MdStar,
    MdLocationOn,
    MdLogin,
    MdOpenInNew,
    MdSettings,
    MdHome,
    MdDashboard,
    MdTrendingUp,
    MdBookmark,
    MdGrade
} from 'react-icons/md';

const AllClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [userEnrolledClassrooms, setUserEnrolledClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');

    // Fetch all classrooms and user's enrolled classrooms
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                console.log('📋 Fetching all classrooms...');

                // Fetch all classrooms
                const allClassroomsResponse = await axiosPublic.get('/classrooms');

                // Fetch user's enrolled classrooms (as student)
                let userClassroomsResponse = null;
                if (user?.email) {
                    try {
                        userClassroomsResponse = await axiosPublic.get(`/classrooms/student/${user.email}`);
                    } catch (error) {
                        console.log('No student classrooms found or error:', error);
                    }
                }

                if (allClassroomsResponse.data.success) {
                    setClassrooms(allClassroomsResponse.data.classrooms);
                    console.log('✅ Found classrooms:', allClassroomsResponse.data.classrooms);
                }

                if (userClassroomsResponse?.data.success) {
                    setUserEnrolledClassrooms(userClassroomsResponse.data.classrooms || []);
                    console.log('✅ User enrolled classrooms:', userClassroomsResponse.data.classrooms);
                }
            } catch (error) {
                console.error('❌ Error fetching classrooms:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to load classes. Please try again.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [axiosPublic, user]);

    // Get unique subjects and grades for filters
    const subjects = [...new Set(classrooms.map(c => c.subject).filter(Boolean))];
    const grades = [...new Set(classrooms.map(c => c.grade).filter(Boolean))];

    // Check if user is the teacher/owner of a classroom
    const isUserTeacher = (classroom) => {
        return classroom.teacherEmail === user?.email;
    };

    // Check if user is enrolled as student
    const isUserEnrolledAsStudent = (classroomId) => {
        return userEnrolledClassrooms.some(enrolled => enrolled._id === classroomId);
    };

    // Filter classrooms
    const filteredClassrooms = classrooms.filter(classroom => {
        const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classroom.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = !selectedSubject || classroom.subject === selectedSubject;
        const matchesGrade = !selectedGrade || classroom.grade === selectedGrade;

        return matchesSearch && matchesSubject && matchesGrade;
    });

    // Get button configuration based on user relationship to classroom
    const getButtonConfig = (classroom) => {
        if (isUserTeacher(classroom)) {
            return {
                text: 'Manage Class',
                icon: MdSettings,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                tooltip: 'You are the teacher of this class'
            };
        }
        else if (isUserEnrolledAsStudent(classroom._id)) {
            return {
                text: 'Enter Class',
                icon: MdOpenInNew,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                tooltip: 'You are enrolled in this class'
            };
        }
        else {
            return {
                text: 'Join Class',
                icon: MdJoinInner,
                action: () => handleJoinClassroom(classroom),
                className: 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] hover:from-[#3a6b8a] hover:to-[#2d5a75]',
                tooltip: 'Join this class with a class code'
            };
        }
    };

    // Handle join classroom - with actual API call
    const handleJoinClassroom = async (classroom) => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Please Login',
                text: 'You need to be logged in to join a classroom.',
            });
            return;
        }

        const { value: classCode } = await Swal.fire({
            title: `Join "${classroom.name}"?`,
            text: 'Please enter the class code to join this classroom.',
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
                console.log('🚪 Attempting to join classroom with code:', classCode);

                const response = await axiosPublic.post('/classrooms/join', {
                    classCode: classCode.toUpperCase(),
                    studentEmail: user.email,
                    studentName: user.displayName || user.email
                });

                console.log('✅ Join response:', response.data);

                if (response.data.success) {
                    const result = await Swal.fire({
                        icon: 'success',
                        title: 'Joined Successfully!',
                        text: `Welcome to "${response.data.classroom.name}"`,
                        showCancelButton: true,
                        confirmButtonText: 'Enter Classroom',
                        cancelButtonText: 'Stay Here',
                        confirmButtonColor: '#457B9D'
                    });

                    setUserEnrolledClassrooms(prev => [...prev, response.data.classroom]);

                    if (result.isConfirmed) {
                        navigate(`/classroom/${response.data.classroom.id || classroom._id}`);
                    }
                } else {
                    throw new Error(response.data.message || 'Failed to join classroom');
                }
            } catch (error) {
                console.error('❌ Error joining classroom:', error);

                let errorMessage = 'Failed to join classroom. Please try again.';

                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Join Failed!',
                    text: errorMessage
                });
            }
        }
    };

    // Handle enter classroom for already enrolled students or teachers
    const handleEnterClassroom = (classroomId) => {
        navigate(`/classroom/${classroomId}`);
    };

    // Get stats for display
    const getDisplayStats = () => {
        const teacherClasses = filteredClassrooms.filter(c => isUserTeacher(c)).length;
        const enrolledClasses = userEnrolledClassrooms.length;

        return { teacherClasses, enrolledClasses };
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#457B9D] border-t-transparent mx-auto mb-6"></div>
                    <p className="text-gray-700 font-semibold text-lg">Loading amazing classes...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest courses</p>
                </div>
            </div>
        );
    }

    const { teacherClasses, enrolledClasses } = getDisplayStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Discover Classes</title>
            </Helmet>

            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] rounded-xl flex items-center justify-center">
                                    <MdSchool className="text-white text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">EduGrid</h1>
                            </div>
                            <div className="hidden md:flex items-center space-x-6">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center text-gray-600 hover:text-[#457B9D] transition-colors"
                                >
                                    <MdDashboard className="mr-2" />
                                    Dashboard
                                </button>
                                <button className="flex items-center text-[#457B9D] font-medium">
                                    <MdSchool className="mr-2" />
                                    All Classes
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                                {enrolledClasses > 0 && (
                                    <span className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                        <MdBookmark className="mr-1" />
                                        {enrolledClasses} Enrolled
                                    </span>
                                )}
                                {teacherClasses > 0 && (
                                    <span className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                        <MdSettings className="mr-1" />
                                        {teacherClasses} Teaching
                                    </span>
                                )}
                            </div>
                            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] flex items-center justify-center text-white text-sm font-medium">
                                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <div className="mb-6">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                            Discover Amazing
                            <span className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] bg-clip-text text-transparent"> Classes</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Join thousands of learners exploring knowledge from world-class educators.
                            Find your perfect course and start your learning journey today.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center space-x-8 mb-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-[#457B9D]">{classrooms.length}+</div>
                            <div className="text-sm text-gray-600">Total Classes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{subjects.length}+</div>
                            <div className="text-sm text-gray-600">Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}+
                            </div>
                            <div className="text-sm text-gray-600">Students</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="mb-12 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Search Bar */}
                        <div className="lg:col-span-6 relative">
                            <input
                                type="text"
                                placeholder="Search classes, subjects, or teachers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#457B9D]/20 focus:border-[#457B9D] transition-all text-lg"
                            />
                            <MdSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl" />
                        </div>

                        {/* Subject Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#457B9D]/20 focus:border-[#457B9D] transition-all text-lg"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Grade Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#457B9D]/20 focus:border-[#457B9D] transition-all text-lg"
                            >
                                <option value="">All Grades</option>
                                {grades.map(grade => (
                                    <option key={grade} value={grade}>
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <p className="text-gray-600 text-lg">
                                <span className="font-semibold text-gray-900">{filteredClassrooms.length}</span> of {classrooms.length} classes
                            </p>
                            {(searchTerm || selectedSubject || selectedGrade) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                        setSelectedGrade('');
                                    }}
                                    className="text-[#457B9D] hover:text-[#3a6b8a] transition-colors text-sm underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                        <button className="flex items-center text-[#457B9D] hover:text-[#3a6b8a] transition-colors font-medium">
                            <MdFilterList className="mr-2" />
                            Advanced Filters
                        </button>
                    </div>
                </div>

                {/* Classes Grid */}
                {filteredClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredClassrooms.map((classroom) => {
                            const buttonConfig = getButtonConfig(classroom);
                            const isTeacher = isUserTeacher(classroom);
                            const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                            return (
                                <div key={classroom._id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                    {/* Class Image */}
                                    <div className="h-56 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] relative overflow-hidden">
                                        {classroom.imageUrl ? (
                                            <img
                                                src={classroom.imageUrl}
                                                alt={classroom.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdSchool className="text-white text-8xl opacity-30" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-6 right-6">
                                            {isTeacher ? (
                                                <div className="bg-purple-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                                                    <MdSchool className="mr-2" />
                                                    Owner
                                                </div>
                                            ) : isEnrolledStudent ? (
                                                <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                                                    <MdLogin className="mr-2" />
                                                    Enrolled
                                                </div>
                                            ) : (
                                                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                                                    <MdStar className="mr-2 text-yellow-300" />
                                                    4.8
                                                </div>
                                            )}
                                        </div>

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                    </div>

                                    {/* Class Info */}
                                    <div className="p-8">
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#457B9D] transition-colors">
                                                {classroom.name}
                                            </h3>
                                            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                                    <MdSchool className="mr-2" />
                                                    {classroom.subject}
                                                </span>
                                                {classroom.grade && (
                                                    <span className="flex items-center bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                                                        <MdGrade className="mr-2" />
                                                        {classroom.grade}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 flex items-center">
                                                <MdLocationOn className="mr-2 text-gray-400" />
                                                by <span className="font-semibold ml-1">{classroom.teacherName}</span>
                                                {isTeacher && (
                                                    <span className="ml-2 text-purple-600 font-semibold">(You)</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        {classroom.description && (
                                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                                                {classroom.description}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
                                            <span className="flex items-center text-gray-700 font-medium">
                                                <MdPeople className="mr-2 text-lg" />
                                                {classroom.students?.length || 0} Students
                                            </span>
                                            <span className="text-green-600 font-bold text-lg">
                                                Free
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Enrollment Progress</span>
                                                <span className="font-semibold">{Math.round(((classroom.students?.length || 0) / classroom.maxStudents) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] h-3 rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${Math.min(((classroom.students?.length || 0) / classroom.maxStudents) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={buttonConfig.action}
                                                className={`flex-1 ${buttonConfig.className} text-white py-3 px-6 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105`}
                                                title={buttonConfig.tooltip}
                                            >
                                                <buttonConfig.icon className="mr-2 text-lg" />
                                                {buttonConfig.text}
                                            </button>
                                            <button
                                                onClick={() => navigate(`/classroom/${classroom._id}`)}
                                                className="bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                                            >
                                                {isTeacher ? 'View' : 'Preview'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Enhanced Empty State */
                    <div className="text-center py-20">
                        <div className="max-w-lg mx-auto">
                            <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                                <MdSchool className="text-gray-400 text-8xl" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                {searchTerm || selectedSubject || selectedGrade ? 'No matching classes found' : 'No classes available'}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                {searchTerm || selectedSubject || selectedGrade
                                    ? 'No classes match your current search criteria. Try adjusting your filters or search terms to discover more courses.'
                                    : 'No classes are currently available. Check back soon as new courses are added regularly by our amazing educators.'
                                }
                            </p>
                            {(searchTerm || selectedSubject || selectedGrade) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                        setSelectedGrade('');
                                    }}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-2xl hover:from-[#3a6b8a] hover:to-[#2d5a75] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <MdFilterList className="mr-2" />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllClasses;
