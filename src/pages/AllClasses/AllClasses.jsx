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
    MdOpenInNew,
    MdSettings,
    MdVerified,
    MdArrowForward,
    MdPersonOutline,
    MdCheckCircle
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

    // Get unique subjects for filters
    const subjects = [...new Set(classrooms.map(c => c.subject).filter(Boolean))];

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

        return matchesSearch && matchesSubject;
    });

    // Get button configuration based on user relationship to classroom
    const getButtonConfig = (classroom) => {
        if (isUserTeacher(classroom)) {
            return {
                text: 'Manage',
                icon: MdSettings,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-slate-900 hover:bg-slate-800 text-white',
                status: 'instructor'
            };
        }
        else if (isUserEnrolledAsStudent(classroom._id)) {
            return {
                text: 'Continue',
                icon: MdArrowForward,
                action: () => handleEnterClassroom(classroom._id),
                className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                status: 'enrolled'
            };
        }
        else {
            return {
                text: 'Join',
                icon: MdJoinInner,
                action: () => handleJoinClassroom(classroom),
                className: 'bg-blue-600 hover:bg-blue-700 text-white',
                status: 'available'
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <Helmet>
                <title>EduGrid | Discover Classes</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Modern Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-slate-900 mb-6 tracking-tight">
                        Discover
                        <span className="block font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Excellence
                        </span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
                        Join a community of passionate learners and world-class educators.
                        Transform your knowledge and unlock new possibilities.
                    </p>

                    {/* Elegant Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-light text-slate-800 mb-2">{classrooms.length}+</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Active Classes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-light text-slate-800 mb-2">{subjects.length}+</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Subjects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-light text-slate-800 mb-2">
                                {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}+
                            </div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Learners</div>
                        </div>
                    </div>
                </div>

                {/* Minimalist Search Section */}
                <div className="mb-16 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Search Bar */}
                        <div className="lg:col-span-3 relative">
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-6 py-4 pl-14 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg placeholder-slate-400"
                            />
                            <MdSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl" />
                        </div>

                        {/* Subject Filter */}
                        <div className="lg:col-span-1">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-slate-600 text-lg">
                            <span className="font-semibold text-slate-800">{filteredClassrooms.length}</span> classes available
                        </p>
                        {(searchTerm || selectedSubject) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSubject('');
                                }}
                                className="text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-50"
                            >
                                Clear filters ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Compact Professional Cards Grid */}
                {filteredClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredClassrooms.map((classroom) => {
                            const buttonConfig = getButtonConfig(classroom);
                            const isTeacher = isUserTeacher(classroom);
                            const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                            return (
                                <div key={classroom._id} className="group cursor-pointer">
                                    {/* Compact Card Design */}
                                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-slate-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/10 hover:-translate-y-1">

                                        {/* Smaller Image Section */}
                                        <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                                            {classroom.imageUrl ? (
                                                <img
                                                    src={classroom.imageUrl}
                                                    alt={classroom.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center">
                                                    <MdSchool className="text-slate-400 text-3xl" />
                                                </div>
                                            )}

                                            {/* Status Badge - Only for instructor/enrolled */}
                                            {(isTeacher || isEnrolledStudent) && (
                                                <div className="absolute top-3 right-3">
                                                    {isTeacher ? (
                                                        <div className="bg-slate-900/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                                            <MdVerified className="w-3 h-3 mr-1" />
                                                            Instructor
                                                        </div>
                                                    ) : (
                                                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                                            <MdCheckCircle className="w-3 h-3 mr-1" />
                                                            Enrolled
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Compact Content Section */}
                                        <div className="p-5">
                                            {/* Title */}
                                            <h3 className="text-base font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
                                                {classroom.name}
                                            </h3>

                                            {/* Subject */}
                                            <div className="inline-flex items-center bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm font-medium mb-3">
                                                {classroom.subject}
                                            </div>

                                            {/* Instructor & Students */}
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                                                <div className="flex items-center">
                                                    <MdPersonOutline className="w-3 h-3 mr-1" />
                                                    <span className="truncate">{classroom.teacherName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MdPeople className="w-3 h-3 mr-1" />
                                                    <span>{classroom.students?.length || 0}</span>
                                                </div>
                                            </div>

                                            {/* Compact Action Button */}
                                            <button
                                                onClick={buttonConfig.action}
                                                className={`w-full ${buttonConfig.className} py-3 px-4 rounded-xl transition-all duration-200 font-medium text-sm flex items-center justify-center group/btn transform hover:scale-[1.02] active:scale-[0.98]`}
                                            >
                                                {buttonConfig.text}
                                                <buttonConfig.icon className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Compact Empty State */
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <MdSchool className="text-slate-400 text-3xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-3">
                                {searchTerm || selectedSubject ? 'No classes found' : 'No classes available'}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {searchTerm || selectedSubject
                                    ? 'Try adjusting your search criteria.'
                                    : 'New courses coming soon.'
                                }
                            </p>
                            {(searchTerm || selectedSubject) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                    }}
                                    className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium"
                                >
                                    <MdFilterList className="mr-2" />
                                    Clear Filters
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
