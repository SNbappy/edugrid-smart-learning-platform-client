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
        <div className="min-h-screen bg-[#DCE8F5] font-poppins" style={{
            // backgroundColor: '#f8fafc',
            colorScheme: 'light'
        }}>
            <Helmet>
                <title>EduGrid | All Classes</title>
                <meta name="color-scheme" content="light" />
            </Helmet>

            <style>{`
                input, select {
                    color-scheme: light;
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                    border-color: #cbd5e1 !important;
                }
                
                input::placeholder {
                    color: #94a3b8 !important;
                }
                
                select option {
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Simplified Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0f172a' }}>
                        All Classes
                    </h1>
                    <p className="text-lg" style={{ color: '#64748b' }}>
                        Browse and join classes that interest you
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="rounded-xl p-6" style={{
                        backgroundColor: '#ffffff',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#e2e8f0'
                    }}>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#0f172a' }}>
                            {classrooms.length}
                        </div>
                        <div className="text-sm font-medium" style={{ color: '#64748b' }}>
                            Active Classes
                        </div>
                    </div>
                    <div className="rounded-xl p-6" style={{
                        backgroundColor: '#ffffff',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#e2e8f0'
                    }}>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#0f172a' }}>
                            {subjects.length}
                        </div>
                        <div className="text-sm font-medium" style={{ color: '#64748b' }}>
                            Subjects
                        </div>
                    </div>
                    <div className="rounded-xl p-6" style={{
                        backgroundColor: '#ffffff',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: '#e2e8f0'
                    }}>
                        <div className="text-3xl font-bold mb-1" style={{ color: '#0f172a' }}>
                            {classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                        </div>
                        <div className="text-sm font-medium" style={{ color: '#64748b' }}>
                            Students
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="rounded-xl p-6 mb-8" style={{
                    backgroundColor: '#ffffff',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#e2e8f0'
                }}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Search Bar */}
                        <div className="lg:col-span-3 relative">
                            <input
                                type="text"
                                placeholder="Search classes, subjects, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-5 py-3 pl-12 rounded-lg transition-all text-base"
                                style={{
                                    backgroundColor: '#f8fafc',
                                    color: '#1e293b',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: '#e2e8f0'
                                }}
                            />
                            <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl" style={{ color: '#94a3b8' }} />
                        </div>

                        {/* Subject Filter */}
                        <div className="lg:col-span-1">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg transition-all text-base"
                                style={{
                                    backgroundColor: '#f8fafc',
                                    color: '#1e293b',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: '#e2e8f0'
                                }}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-4 flex items-center justify-between">
                        <p style={{ color: '#64748b' }}>
                            <span className="font-semibold" style={{ color: '#0f172a' }}>{filteredClassrooms.length}</span> classes found
                        </p>
                        {(searchTerm || selectedSubject) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedSubject('');
                                }}
                                className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                style={{
                                    color: '#457B9D',
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Classes Grid */}
                {filteredClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredClassrooms.map((classroom) => {
                            const buttonConfig = getButtonConfig(classroom);
                            const isTeacher = isUserTeacher(classroom);
                            const isEnrolledStudent = isUserEnrolledAsStudent(classroom._id);

                            return (
                                <div
                                    key={classroom._id}
                                    className="rounded-xl overflow-hidden transition-all duration-300"
                                    style={{
                                        backgroundColor: '#ffffff',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                        borderColor: '#e2e8f0'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {/* Image Section */}
                                    <div className="relative h-40 overflow-hidden" style={{
                                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                                    }}>
                                        {classroom.imageUrl ? (
                                            <img
                                                src={classroom.imageUrl}
                                                alt={classroom.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MdSchool className="text-4xl" style={{ color: '#94a3b8' }} />
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        {(isTeacher || isEnrolledStudent) && (
                                            <div className="absolute top-3 right-3">
                                                {isTeacher ? (
                                                    <div className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        color: '#ffffff'
                                                    }}>
                                                        <MdVerified className="w-3 h-3 mr-1" />
                                                        Instructor
                                                    </div>
                                                ) : (
                                                    <div className="px-3 py-1 rounded-full text-xs font-semibold flex items-center" style={{
                                                        backgroundColor: 'rgba(5, 150, 105, 0.9)',
                                                        color: '#ffffff'
                                                    }}>
                                                        <MdCheckCircle className="w-3 h-3 mr-1" />
                                                        Enrolled
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5">
                                        {/* Title */}
                                        <h3 className="text-base font-bold mb-3 line-clamp-2" style={{ color: '#0f172a' }}>
                                            {classroom.name}
                                        </h3>

                                        {/* Subject Badge */}
                                        <div className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium mb-4" style={{
                                            backgroundColor: '#f1f5f9',
                                            color: '#334155'
                                        }}>
                                            {classroom.subject}
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-sm mb-4" style={{ color: '#64748b' }}>
                                            <div className="flex items-center">
                                                <MdPersonOutline className="w-4 h-4 mr-1" />
                                                <span className="truncate">{classroom.teacherName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MdPeople className="w-4 h-4 mr-1" />
                                                <span>{classroom.students?.length || 0}</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={buttonConfig.action}
                                            className="w-full py-3 px-4 rounded-lg transition-all duration-200 font-semibold text-sm flex items-center justify-center"
                                            style={{
                                                backgroundColor: buttonConfig.bgColor,
                                                color: '#ffffff'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = buttonConfig.hoverBgColor;
                                                e.target.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = buttonConfig.bgColor;
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            {buttonConfig.text}
                                            <buttonConfig.icon className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6" style={{
                                backgroundColor: '#f1f5f9'
                            }}>
                                <MdSchool className="text-4xl" style={{ color: '#94a3b8' }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: '#1e293b' }}>
                                {searchTerm || selectedSubject ? 'No classes found' : 'No classes available'}
                            </h3>
                            <p className="mb-6" style={{ color: '#64748b' }}>
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
                                    className="inline-flex items-center px-6 py-3 rounded-xl transition-all font-semibold"
                                    style={{
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1e293b'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#0f172a'}
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
