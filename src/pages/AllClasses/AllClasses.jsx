import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
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
    MdSettings
} from 'react-icons/md';

const AllClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [userEnrolledClassrooms, setUserEnrolledClassrooms] = useState([]); // Track user's enrolled classrooms
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
        // Priority 1: Check if user is the teacher/owner
        if (isUserTeacher(classroom)) {
            return {
                text: 'Manage Class',
                icon: MdSettings,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-purple-500 hover:bg-purple-600',
                tooltip: 'You are the teacher of this class'
            };
        }
        // Priority 2: Check if user is enrolled as student
        else if (isUserEnrolledAsStudent(classroom._id)) {
            return {
                text: 'Enter Class',
                icon: MdOpenInNew,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-green-500 hover:bg-green-600',
                tooltip: 'You are enrolled in this class'
            };
        }
        // Priority 3: User needs to join
        else {
            return {
                text: 'Join Class',
                icon: MdJoinInner,
                action: () => handleJoinClassroom(classroom),
                className: 'bg-[#457B9D] hover:bg-[#3a6b8a]',
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

                // Call the actual join API
                const response = await axiosPublic.post('/classrooms/join', {
                    classCode: classCode.toUpperCase(),
                    studentEmail: user.email,
                    studentName: user.displayName || user.email
                });

                console.log('✅ Join response:', response.data);

                if (response.data.success) {
                    // Show success message
                    const result = await Swal.fire({
                        icon: 'success',
                        title: 'Joined Successfully!',
                        text: `Welcome to "${response.data.classroom.name}"`,
                        showCancelButton: true,
                        confirmButtonText: 'Enter Classroom',
                        cancelButtonText: 'Stay Here',
                        confirmButtonColor: '#457B9D'
                    });

                    // Update the enrolled classrooms list
                    setUserEnrolledClassrooms(prev => [...prev, response.data.classroom]);

                    // If user wants to enter classroom immediately
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
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading classes...</p>
                </div>
            </div>
        );
    }

    const { teacherClasses, enrolledClasses } = getDisplayStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | All Classes</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">All Classes</h1>
                                    <p className="text-lg text-gray-600">
                                        Discover and join classes from educators around the world
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] flex items-center justify-center shadow-lg">
                                        <MdSchool className="text-white text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search Bar */}
                                <div className="md:col-span-2 relative">
                                    <input
                                        type="text"
                                        placeholder="Search classes, subjects, or teachers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                                    />
                                    <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                </div>

                                {/* Subject Filter */}
                                <div>
                                    <select
                                        value={selectedSubject}
                                        onChange={(e) => setSelectedSubject(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
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
                                <div>
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
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
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-gray-600">
                                    Showing {filteredClassrooms.length} of {classrooms.length} classes
                                    {enrolledClasses > 0 && (
                                        <span className="ml-2 text-green-600 font-medium">
                                            • {enrolledClasses} enrolled
                                        </span>
                                    )}
                                    {teacherClasses > 0 && (
                                        <span className="ml-2 text-purple-600 font-medium">
                                            • {teacherClasses} owned
                                        </span>
                                    )}
                                </p>
                                <button className="flex items-center text-[#457B9D] hover:text-[#3a6b8a] transition-colors">
                                    <MdFilterList className="mr-1" />
                                    More Filters
                                </button>
                            </div>
                        </div>

                        {/* Classes Grid */}
                        {filteredClassrooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredClassrooms.map((classroom) => {
                                    const buttonConfig = getButtonConfig(classroom);
                                    const isTeacher = isUserTeacher(classroom);
                                    const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                                    return (
                                        <div key={classroom._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                            {/* Class Image */}
                                            <div className="h-48 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] relative overflow-hidden">
                                                {classroom.imageUrl ? (
                                                    <img
                                                        src={classroom.imageUrl}
                                                        alt={classroom.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <MdSchool className="text-white text-6xl opacity-50" />
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4">
                                                    {isTeacher ? (
                                                        <div className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                                            <MdSchool className="mr-1" />
                                                            Owner
                                                        </div>
                                                    ) : isEnrolledStudent ? (
                                                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                                            <MdLogin className="mr-1" />
                                                            Enrolled
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                                            <MdStar className="mr-1 text-yellow-300" />
                                                            4.8
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Class Info */}
                                            <div className="p-6">
                                                <div className="mb-4">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                                        {classroom.name}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                                        <span className="flex items-center">
                                                            <MdSchool className="mr-1" />
                                                            {classroom.subject}
                                                        </span>
                                                        {classroom.grade && (
                                                            <span className="flex items-center">
                                                                <MdCalendarToday className="mr-1" />
                                                                {classroom.grade}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <MdLocationOn className="mr-1" />
                                                        by {classroom.teacherName}
                                                        {isTeacher && (
                                                            <span className="ml-2 text-purple-600 font-medium">(You)</span>
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Description */}
                                                {classroom.description && (
                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                                        {classroom.description}
                                                    </p>
                                                )}

                                                {/* Stats */}
                                                <div className="flex items-center justify-between text-sm mb-4">
                                                    <span className="flex items-center text-gray-600">
                                                        <MdPeople className="mr-1" />
                                                        {classroom.students?.length || 0} Students
                                                    </span>
                                                    <span className="text-green-600 font-medium">
                                                        Free
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                        <span>Enrollment</span>
                                                        <span>{Math.round(((classroom.students?.length || 0) / classroom.maxStudents) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-[#457B9D] h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(((classroom.students?.length || 0) / classroom.maxStudents) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={buttonConfig.action}
                                                        className={`flex-1 ${buttonConfig.className} text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center`}
                                                        title={buttonConfig.tooltip}
                                                    >
                                                        <buttonConfig.icon className="mr-1" />
                                                        {buttonConfig.text}
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/classroom/${classroom._id}`)}
                                                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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
                            /* Empty State */
                            <div className="text-center py-16">
                                <div className="max-w-md mx-auto">
                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MdSchool className="text-gray-400 text-6xl" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        No classes found
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchTerm || selectedSubject || selectedGrade
                                            ? 'No classes match your current filters. Try adjusting your search criteria.'
                                            : 'No classes are available at the moment. Check back later for new courses.'
                                        }
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedSubject('');
                                            setSelectedGrade('');
                                        }}
                                        className="inline-flex items-center px-6 py-3 bg-[#457B9D] text-white rounded-xl hover:bg-[#3a6b8a] transition-colors font-semibold"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AllClasses;
