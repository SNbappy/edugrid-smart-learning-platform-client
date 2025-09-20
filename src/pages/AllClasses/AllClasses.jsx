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
    MdJoinInner,
    MdStar,
    MdLocationOn,
    MdLogin,
    MdOpenInNew,
    MdSettings,
    MdDashboard,
    MdBookmark,
    MdGrade,
    MdVerified,
    MdTrendingUp,
    MdAccessTime,
    MdLanguage
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
                className: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25',
                tooltip: 'You are the teacher of this class'
            };
        }
        else if (isUserEnrolledAsStudent(classroom._id)) {
            return {
                text: 'Continue Learning',
                icon: MdOpenInNew,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25',
                tooltip: 'You are enrolled in this class'
            };
        }
        else {
            return {
                text: 'Join Class',
                icon: MdJoinInner,
                action: () => handleJoinClassroom(classroom),
                className: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25',
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Classes</h3>
                    <p className="text-slate-600">Discovering amazing learning opportunities...</p>
                </div>
            </div>
        );
    }

    const { teacherClasses, enrolledClasses } = getDisplayStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <Helmet>
                <title>EduGrid | Discover Classes</title>
            </Helmet>

            {/* Navigation Bar */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <MdSchool className="text-white text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">EduGrid</h1>
                                    <p className="text-xs text-slate-500 -mt-1">Learn • Grow • Excel</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center space-x-6">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center px-3 py-2 text-slate-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50/50"
                                >
                                    <MdDashboard className="mr-2" />
                                    Dashboard
                                </button>
                                <div className="flex items-center px-3 py-2 text-blue-600 font-medium bg-blue-50 rounded-lg">
                                    <MdSchool className="mr-2" />
                                    All Classes
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden lg:flex items-center space-x-3">
                                {enrolledClasses > 0 && (
                                    <div className="flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200">
                                        <MdBookmark className="mr-2 w-4 h-4" />
                                        {enrolledClasses} Enrolled
                                    </div>
                                )}
                                {teacherClasses > 0 && (
                                    <div className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200">
                                        <MdSettings className="mr-2 w-4 h-4" />
                                        {teacherClasses} Teaching
                                    </div>
                                )}
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-blue-300 transition-all">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
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
                    <div className="mb-8">
                        <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                            Discover
                            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> Excellence</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-8">
                            Join a community of passionate learners and world-class educators.
                            Transform your knowledge and unlock new possibilities.
                        </p>
                    </div>

                    {/* Enhanced Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <MdSchool className="text-white text-xl" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800">{classrooms.length}+</div>
                            <div className="text-sm text-slate-600 font-medium">Active Classes</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <MdGrade className="text-white text-xl" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800">{subjects.length}+</div>
                            <div className="text-sm text-slate-600 font-medium">Subject Areas</div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <MdPeople className="text-white text-xl" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800">
                                {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}+
                            </div>
                            <div className="text-sm text-slate-600 font-medium">Global Learners</div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="mb-12 bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Search Bar */}
                        <div className="lg:col-span-6 relative">
                            <input
                                type="text"
                                placeholder="Search classes, subjects, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 pl-14 bg-white/80 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg placeholder-slate-500"
                            />
                            <MdSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl" />
                        </div>

                        {/* Subject Filter */}
                        <div className="lg:col-span-3">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
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
                                className="w-full px-4 py-4 bg-white/80 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                            >
                                <option value="">All Levels</option>
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
                            <p className="text-slate-600 text-lg">
                                <span className="font-semibold text-slate-800">{filteredClassrooms.length}</span> classes found
                            </p>
                            {(searchTerm || selectedSubject || selectedGrade) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                        setSelectedGrade('');
                                    }}
                                    className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
                                >
                                    Clear filters ×
                                </button>
                            )}
                        </div>
                        <button className="flex items-center text-slate-600 hover:text-blue-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
                            <MdFilterList className="mr-2" />
                            Advanced
                        </button>
                    </div>
                </div>

                {/* Classes Grid - Enhanced Professional Cards */}
                {filteredClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredClassrooms.map((classroom) => {
                            const buttonConfig = getButtonConfig(classroom);
                            const isTeacher = isUserTeacher(classroom);
                            const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                            return (
                                <div key={classroom._id} className="group relative">
                                    {/* Card Container */}
                                    <div className="bg-white rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 transform hover:-translate-y-1">

                                        {/* Image Header */}
                                        <div className="relative h-48 overflow-hidden">
                                            {classroom.imageUrl ? (
                                                <img
                                                    src={classroom.imageUrl}
                                                    alt={classroom.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <MdSchool className="text-white/30 text-6xl" />
                                                </div>
                                            )}

                                            {/* Overlay Gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4">
                                                {isTeacher ? (
                                                    <div className="flex items-center bg-indigo-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/20">
                                                        <MdVerified className="mr-1.5 w-3.5 h-3.5" />
                                                        Instructor
                                                    </div>
                                                ) : isEnrolledStudent ? (
                                                    <div className="flex items-center bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/20">
                                                        <MdLogin className="mr-1.5 w-3.5 h-3.5" />
                                                        Enrolled
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/30">
                                                        <MdStar className="mr-1.5 w-3.5 h-3.5 text-yellow-300" />
                                                        Featured
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Stats Overlay */}
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center space-x-3 text-white/90 text-sm">
                                                    <div className="flex items-center bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                        <MdPeople className="mr-1 w-4 h-4" />
                                                        {classroom.students?.length || 0}
                                                    </div>
                                                    <div className="flex items-center bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                                                        <MdAccessTime className="mr-1 w-4 h-4" />
                                                        Active
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-6">
                                            {/* Header Info */}
                                            <div className="mb-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 mr-2">
                                                        {classroom.name}
                                                    </h3>
                                                    {isTeacher && (
                                                        <div className="text-indigo-600 text-xs font-medium bg-indigo-50 px-2 py-1 rounded-md">
                                                            YOURS
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Subject & Grade Tags */}
                                                <div className="flex items-center flex-wrap gap-2 mb-3">
                                                    <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                                                        <MdSchool className="mr-1.5 w-3 h-3" />
                                                        {classroom.subject}
                                                    </span>
                                                    {classroom.grade && (
                                                        <span className="inline-flex items-center bg-slate-50 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-100">
                                                            <MdGrade className="mr-1.5 w-3 h-3" />
                                                            {classroom.grade}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Instructor Info */}
                                                <div className="flex items-center text-slate-600 text-sm mb-4">
                                                    <MdLocationOn className="mr-2 w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{classroom.teacherName}</span>
                                                    {isTeacher && (
                                                        <span className="ml-2 text-indigo-600 font-semibold">(You)</span>
                                                    )}
                                                    <div className="ml-auto flex items-center">
                                                        <MdLanguage className="w-3 h-3 mr-1 text-slate-400" />
                                                        <span className="text-xs text-slate-500">English</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {classroom.description && (
                                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-6 bg-slate-50/50 p-3 rounded-xl">
                                                    {classroom.description}
                                                </p>
                                            )}

                                            {/* Stats Row */}
                                            <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-2xl border border-slate-100">
                                                <div className="flex items-center space-x-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-slate-800">{classroom.students?.length || 0}</div>
                                                        <div className="text-xs text-slate-500 font-medium">Students</div>
                                                    </div>
                                                    <div className="w-px h-8 bg-slate-200"></div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-emerald-600">Free</div>
                                                        <div className="text-xs text-slate-500 font-medium">Course</div>
                                                    </div>
                                                </div>

                                                {/* Rating */}
                                                <div className="flex items-center space-x-1">
                                                    <MdStar className="w-4 h-4 text-yellow-400" />
                                                    <MdStar className="w-4 h-4 text-yellow-400" />
                                                    <MdStar className="w-4 h-4 text-yellow-400" />
                                                    <MdStar className="w-4 h-4 text-yellow-400" />
                                                    <MdStar className="w-4 h-4 text-slate-300" />
                                                    <span className="text-sm font-medium text-slate-600 ml-1">4.8</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-6">
                                                <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                                                    <span className="font-medium flex items-center">
                                                        <MdTrendingUp className="mr-1 w-4 h-4" />
                                                        Capacity
                                                    </span>
                                                    <span className="font-semibold text-slate-700">
                                                        {Math.round(((classroom.students?.length || 0) / (classroom.maxStudents || 100)) * 100)}% filled
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                                        style={{
                                                            width: `${Math.min(((classroom.students?.length || 0) / (classroom.maxStudents || 100)) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-3">
                                                <button
                                                    onClick={buttonConfig.action}
                                                    className={`w-full ${buttonConfig.className} text-white py-3.5 px-6 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center group/btn transform hover:scale-[1.02] active:scale-[0.98]`}
                                                    title={buttonConfig.tooltip}
                                                >
                                                    <buttonConfig.icon className="mr-2.5 w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                    {buttonConfig.text}
                                                </button>

                                                {/* Secondary Action - Only for authorized users */}
                                                {(isTeacher || isEnrolledStudent) && (
                                                    <button
                                                        onClick={() => navigate(`/classroom/${classroom._id}`)}
                                                        className="w-full bg-slate-100 text-slate-700 py-2.5 px-6 rounded-xl hover:bg-slate-200 transition-all duration-300 font-medium text-sm border border-slate-200 hover:border-slate-300"
                                                    >
                                                        {isTeacher ? 'View Dashboard' : 'Access Classroom'}
                                                    </button>
                                                )}
                                            </div>
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
                            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                                <MdSchool className="text-slate-400 text-6xl" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 mb-4">
                                {searchTerm || selectedSubject || selectedGrade ? 'No matching classes found' : 'No classes available'}
                            </h3>
                            <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                                {searchTerm || selectedSubject || selectedGrade
                                    ? 'No classes match your current criteria. Try adjusting your search or explore different subjects.'
                                    : 'New courses are being added regularly. Check back soon for exciting learning opportunities.'
                                }
                            </p>
                            {(searchTerm || selectedSubject || selectedGrade) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                        setSelectedGrade('');
                                    }}
                                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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
