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
    MdLocationOn
} from 'react-icons/md';

const AllClasses = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');

    // Fetch all classrooms
    useEffect(() => {
        const fetchAllClassrooms = async () => {
            try {
                setIsLoading(true);
                console.log('📋 Fetching all classrooms...');

                const response = await axiosPublic.get('/classrooms');

                if (response.data.success) {
                    setClassrooms(response.data.classrooms);
                    console.log('✅ Found classrooms:', response.data.classrooms);
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

        fetchAllClassrooms();
    }, [axiosPublic]);

    // Get unique subjects and grades for filters
    const subjects = [...new Set(classrooms.map(c => c.subject).filter(Boolean))];
    const grades = [...new Set(classrooms.map(c => c.grade).filter(Boolean))];

    // Filter classrooms
    const filteredClassrooms = classrooms.filter(classroom => {
        const matchesSearch = classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classroom.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = !selectedSubject || classroom.subject === selectedSubject;
        const matchesGrade = !selectedGrade || classroom.grade === selectedGrade;

        return matchesSearch && matchesSubject && matchesGrade;
    });

    // Handle join classroom
    const handleJoinClassroom = async (classroom) => {
        const { value: classCode } = await Swal.fire({
            title: `Join "${classroom.name}"?`,
            text: 'Please enter the class code to join this classroom.',
            input: 'text',
            inputPlaceholder: 'Enter class code',
            showCancelButton: true,
            confirmButtonText: 'Join Class',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter the class code!';
                }
                if (value.toUpperCase() !== classroom.code) {
                    return 'Invalid class code!';
                }
            }
        });

        if (classCode) {
            // Here you would add logic to join the classroom
            // For now, just show success message
            Swal.fire({
                icon: 'success',
                title: 'Joined Successfully!',
                text: `You have joined "${classroom.name}"`,
                timer: 2000,
                showConfirmButton: false
            });
        }
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
                                {filteredClassrooms.map((classroom) => (
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

                                            {/* Rating Badge */}
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                                                    <MdStar className="mr-1 text-yellow-300" />
                                                    4.8
                                                </div>
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
                                                    onClick={() => handleJoinClassroom(classroom)}
                                                    className="flex-1 bg-[#457B9D] text-white py-2 px-4 rounded-lg hover:bg-[#3a6b8a] transition-colors font-medium flex items-center justify-center"
                                                >
                                                    <MdJoinInner className="mr-1" />
                                                    Join Class
                                                </button>
                                                <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                                    Preview
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
