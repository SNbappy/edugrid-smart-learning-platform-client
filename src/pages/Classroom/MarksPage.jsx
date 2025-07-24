import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    MdArrowBack,
    MdGrade,
    MdTrendingUp,
    MdTrendingDown,
    MdPerson,
    MdAssignment,
    MdDownload,
    MdEdit,
    MdAdd,
    MdBarChart
} from 'react-icons/md';

const MarksPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const [classroom, setClassroom] = useState(null);
    const [gradebook, setGradebook] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showAddGrade, setShowAddGrade] = useState(false);

    // Fetch classroom data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    const classroomData = classroomResponse.data.classroom;
                    setClassroom(classroomData);
                    setTasks(classroomData.tasks?.assignments || []);

                    // Generate gradebook data (simulate grades)
                    const generatedGradebook = generateGradebookData(
                        classroomData.students || [],
                        classroomData.tasks?.assignments || []
                    );
                    setGradebook(generatedGradebook);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Failed to load grades.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // Generate sample gradebook data
    const generateGradebookData = (students, tasks) => {
        return students.map(student => {
            const grades = tasks.map(task => ({
                taskId: task.id,
                taskTitle: task.title,
                grade: Math.floor(Math.random() * 40) + 60, // Random grade between 60-100
                maxPoints: task.points || 100,
                submittedAt: new Date(),
                feedback: ''
            }));

            const totalPoints = grades.reduce((sum, grade) => sum + grade.grade, 0);
            const maxTotalPoints = grades.reduce((sum, grade) => sum + grade.maxPoints, 0);
            const average = maxTotalPoints > 0 ? Math.round((totalPoints / maxTotalPoints) * 100) : 0;

            return {
                studentEmail: student.email,
                studentName: student.name,
                grades: grades,
                average: average,
                totalPoints: totalPoints,
                maxTotalPoints: maxTotalPoints
            };
        });
    };

    // Calculate class statistics
    const getClassStats = () => {
        if (gradebook.length === 0) return { average: 0, highest: 0, lowest: 0, passingRate: 0 };

        const averages = gradebook.map(student => student.average);
        const classAverage = Math.round(averages.reduce((sum, avg) => sum + avg, 0) / averages.length);
        const highest = Math.max(...averages);
        const lowest = Math.min(...averages);
        const passingStudents = averages.filter(avg => avg >= 70).length;
        const passingRate = Math.round((passingStudents / averages.length) * 100);

        return { average: classAverage, highest, lowest, passingRate };
    };

    // Update grade
    const updateGrade = async (studentEmail, taskId, newGrade, feedback = '') => {
        try {
            const updatedGradebook = gradebook.map(student => {
                if (student.studentEmail === studentEmail) {
                    const updatedGrades = student.grades.map(grade => {
                        if (grade.taskId === taskId) {
                            return { ...grade, grade: newGrade, feedback };
                        }
                        return grade;
                    });

                    const totalPoints = updatedGrades.reduce((sum, grade) => sum + grade.grade, 0);
                    const maxTotalPoints = updatedGrades.reduce((sum, grade) => sum + grade.maxPoints, 0);
                    const average = maxTotalPoints > 0 ? Math.round((totalPoints / maxTotalPoints) * 100) : 0;

                    return {
                        ...student,
                        grades: updatedGrades,
                        average,
                        totalPoints
                    };
                }
                return student;
            });

            setGradebook(updatedGradebook);
            Swal.fire('Success!', 'Grade updated successfully.', 'success');
        } catch (error) {
            console.error('Error updating grade:', error);
            Swal.fire('Error!', 'Failed to update grade.', 'error');
        }
    };

    const classStats = getClassStats();

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading gradebook...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Grades - {classroom?.name}</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate(`/classroom/${classroomId}`)}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                            >
                                <MdArrowBack className="mr-2" />
                                Back to Classroom
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            Gradebook - {classroom?.name}
                                        </h1>
                                        <p className="text-gray-600">Manage student grades and assessments</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                                            <MdDownload className="mr-2" />
                                            Export
                                        </button>
                                        <button
                                            onClick={() => setShowAddGrade(true)}
                                            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                        >
                                            <MdAdd className="mr-2" />
                                            Add Grade
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Class Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MdBarChart className="text-blue-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Class Average</p>
                                        <p className="text-2xl font-bold text-gray-900">{classStats.average}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <MdTrendingUp className="text-green-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Highest Score</p>
                                        <p className="text-2xl font-bold text-gray-900">{classStats.highest}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <MdTrendingDown className="text-red-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Lowest Score</p>
                                        <p className="text-2xl font-bold text-gray-900">{classStats.lowest}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MdGrade className="text-purple-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Passing Rate</p>
                                        <p className="text-2xl font-bold text-gray-900">{classStats.passingRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gradebook Table */}
                        {gradebook.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <MdGrade className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Grades Yet</h3>
                                <p className="text-gray-500 mb-6">Start grading assignments to build your gradebook.</p>
                                <button
                                    onClick={() => setShowAddGrade(true)}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
                                >
                                    Add First Grade
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                                                    Student
                                                </th>
                                                {tasks.map((task) => (
                                                    <th key={task.id} className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                        <div>
                                                            <div className="truncate">{task.title}</div>
                                                            <div className="text-xs text-gray-400">{task.points || 100} pts</div>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {gradebook.map((student) => (
                                                <tr key={student.studentEmail} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <MdPerson className="text-gray-600" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {student.studentName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {student.studentEmail}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {student.grades.map((grade) => (
                                                        <td key={grade.taskId} className="px-4 py-4 whitespace-nowrap text-center">
                                                            <GradeCell
                                                                grade={grade}
                                                                onUpdate={(newGrade, feedback) =>
                                                                    updateGrade(student.studentEmail, grade.taskId, newGrade, feedback)
                                                                }
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.average >= 90 ? 'bg-green-100 text-green-800' :
                                                                student.average >= 80 ? 'bg-blue-100 text-blue-800' :
                                                                    student.average >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                            }`}>
                                                            {student.average}%
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Grade Modal */}
            {showAddGrade && (
                <AddGradeModal
                    students={classroom?.students || []}
                    tasks={tasks}
                    onClose={() => setShowAddGrade(false)}
                    onSubmit={(studentEmail, taskId, grade, feedback) => {
                        updateGrade(studentEmail, taskId, grade, feedback);
                        setShowAddGrade(false);
                    }}
                />
            )}
        </div>
    );
};

// Grade Cell Component
const GradeCell = ({ grade, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(grade.grade);
    const [feedback, setFeedback] = useState(grade.feedback || '');

    const handleSave = () => {
        if (editValue >= 0 && editValue <= grade.maxPoints) {
            onUpdate(editValue, feedback);
            setIsEditing(false);
        }
    };

    const getGradeColor = () => {
        const percentage = (grade.grade / grade.maxPoints) * 100;
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 80) return 'text-blue-600';
        if (percentage >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                    min="0"
                    max={grade.maxPoints}
                    autoFocus
                />
                <div className="flex gap-1">
                    <button
                        onClick={handleSave}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                    >
                        ✓
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setEditValue(grade.grade);
                        }}
                        className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditing(true)}
            className={`font-medium hover:bg-gray-100 px-2 py-1 rounded transition-colors ${getGradeColor()}`}
        >
            {grade.grade}/{grade.maxPoints}
        </button>
    );
};

// Add Grade Modal
const AddGradeModal = ({ students, tasks, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        studentEmail: '',
        taskId: '',
        grade: '',
        feedback: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.studentEmail && formData.taskId && formData.grade !== '') {
            onSubmit(formData.studentEmail, formData.taskId, parseInt(formData.grade), formData.feedback);
        }
    };

    const selectedTask = tasks.find(task => task.id === formData.taskId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-6">Add Grade</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Student *
                        </label>
                        <select
                            value={formData.studentEmail}
                            onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                                <option key={student.email} value={student.email}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assignment *
                        </label>
                        <select
                            value={formData.taskId}
                            onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select Assignment</option>
                            {tasks.map((task) => (
                                <option key={task.id} value={task.id}>
                                    {task.title} ({task.points || 100} pts)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Grade * {selectedTask && `(out of ${selectedTask.points || 100})`}
                        </label>
                        <input
                            type="number"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter grade"
                            min="0"
                            max={selectedTask?.points || 100}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Feedback
                        </label>
                        <textarea
                            value={formData.feedback}
                            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Optional feedback for student"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
                        >
                            Add Grade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MarksPage;
