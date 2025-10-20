import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import {
    MdSearch,
    MdSchool,
    MdPeople,
    MdJoinInner,
    MdSettings,
    MdVerified,
    MdArrowForward,
    MdPersonOutline,
    MdCheckCircle
} from 'react-icons/md';

const AllClasses = () => {
    const { user } = useContext(AuthContext);
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

                // Fetch all classrooms (ALWAYS - public data)
                const allClassroomsResponse = await axiosPublic.get('/classrooms');

                if (allClassroomsResponse.data.success) {
                    setClassrooms(allClassroomsResponse.data.classrooms);
                    console.log('✅ Found classrooms:', allClassroomsResponse.data.classrooms);
                }

                // Fetch user's enrolled classrooms ONLY if user is logged in
                if (user?.email) {
                    try {
                        const userClassroomsResponse = await axiosPublic.get(`/classrooms/student/${user.email}`);

                        if (userClassroomsResponse?.data.success) {
                            setUserEnrolledClassrooms(userClassroomsResponse.data.classrooms || []);
                            console.log('✅ User enrolled classrooms:', userClassroomsResponse.data.classrooms);
                        }
                    } catch (error) {
                        console.log('No student classrooms found or error:', error);
                        setUserEnrolledClassrooms([]);
                    }
                } else {
                    setUserEnrolledClassrooms([]);
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

        fetchData();
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
                bgColor: '#0f172a',
                hoverBgColor: '#1e293b',
                status: 'instructor'
            };
        }
        else if (isUserEnrolledAsStudent(classroom._id)) {
            return {
                text: 'Continue',
                icon: MdArrowForward,
                action: () => handleEnterClassroom(classroom._id),
                bgColor: '#059669',
                hoverBgColor: '#047857',
                status: 'enrolled'
            };
        }
        else {
            return {
                text: 'Join Class',
                icon: MdJoinInner,
                action: () => handleJoinClassroom(classroom),
                bgColor: '#457B9D',
                hoverBgColor: '#3a6b8a',
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
                confirmButtonColor: '#457B9D',
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

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{
                backgroundColor: '#f8fafc',
                colorScheme: 'light'
            }}>
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 mx-auto mb-6" style={{
                            borderWidth: '4px',
                            borderStyle: 'solid',
                            borderColor: '#e2e8f0',
                            borderTopColor: '#457B9D'
                        }}></div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#1e293b' }}>Loading Classes</h3>
                    <p style={{ color: '#64748b' }}>Please wait...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DCE8F5] font-poppins">
            <Helmet>
                <title>EduGrid | All Classes</title>
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-slate-900">
                        All Classes
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600">
                        Browse and join classes that interest you
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 text-slate-900">
                            {classrooms.length}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-600">
                            Active Classes
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 text-slate-900">
                            {subjects.length}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-600">
                            Subjects
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
                        <div className="text-2xl sm:text-3xl font-bold mb-1 text-slate-900">
                            {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-slate-600">
                            Students
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-slate-200">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search classes, subjects, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 pl-10 sm:pl-12 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />
                            <MdSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl text-slate-400" />
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-sm sm:text-base text-slate-600">
                            <span className="font-semibold text-slate-900">{filteredClassrooms.length}</span> classes found
                        </p>
                        {(searchTerm || selectedSubject) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSubject('');
                                }}
                                className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[#457B9D] hover:bg-slate-50 transition-colors self-start sm:self-auto"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Classes Grid */}
                {filteredClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredClassrooms.map((classroom) => {
                            const buttonConfig = getButtonConfig(classroom);
                            const isTeacher = isUserTeacher(classroom);
                            const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                            return (
                                <div
                                    key={classroom._id}
                                    className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                                        {classroom.imageUrl ? (
                                            <img
                                                src={classroom.imageUrl}
                                                alt={classroom.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdSchool className="text-3xl sm:text-4xl text-slate-400" />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        {(isTeacher || isEnrolledStudent) && (
                                            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                                {isTeacher ? (
                                                    <div className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center bg-slate-900/90 text-white">
                                                        <MdVerified className="w-3 h-3 mr-1" />
                                                        Instructor
                                                    </div>
                                                ) : (
                                                    <div className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center bg-green-600/90 text-white">
                                                        <MdCheckCircle className="w-3 h-3 mr-1" />
                                                        Enrolled
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-4 sm:p-5">
                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 line-clamp-2 text-slate-900">
                                            {classroom.name}
                                        </h3>

                                        {/* Subject Badge */}
                                        <div className="inline-flex items-center px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium mb-3 sm:mb-4 bg-slate-100 text-slate-700">
                                            {classroom.subject}
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-xs sm:text-sm mb-3 sm:mb-4 text-slate-600">
                                            <div className="flex items-center min-w-0 flex-1 mr-2">
                                                <MdPersonOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                                                <span className="truncate text-xs sm:text-sm">{classroom.teacherName}</span>
                                            </div>
                                            <div className="flex items-center flex-shrink-0">
                                                <MdPeople className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                                <span className="text-xs sm:text-sm">{classroom.students?.length || 0}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={buttonConfig.action}
                                            className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 font-semibold text-xs sm:text-sm flex items-center justify-center text-white hover:scale-105"
                                            style={{ backgroundColor: buttonConfig.bgColor }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = buttonConfig.hoverBgColor}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = buttonConfig.bgColor}
                                        >
                                            {buttonConfig.text}
                                            <buttonConfig.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-12 sm:py-16">
                        <div className="max-w-md mx-auto px-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <MdSchool className="text-3xl sm:text-4xl text-slate-400" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900">
                                {searchTerm || selectedSubject ? 'No classes found' : 'No classes available'}
                            </h3>
                            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-slate-600">
                                {searchTerm || selectedSubject
                                    ? 'Try adjusting your search criteria.'
                                    : 'Check back later for new courses.'
                                }
                            </p>
                            {(searchTerm || selectedSubject) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedSubject('');
                                    }}
                                    className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-semibold text-sm sm:text-base"
                                >
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