import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import {
    MdArrowBack,
    MdAdd,
    MdAssignment,
    MdSchedule,
    MdCheckCircle,
    MdPending,
    MdWarning,    // ✅ Replace with MdWarning
    MdEdit,
    MdDelete,
    MdVisibility,
    MdGroup,
    MdDateRange
} from 'react-icons/md';


const TasksPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const [classroom, setClassroom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch classroom and tasks
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);
                    setTasks(classroomResponse.data.classroom.tasks?.assignments || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Failed to load tasks.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // Create new task
    const createTask = async (taskData) => {
        try {
            const newTask = {
                id: Date.now().toString(),
                ...taskData,
                createdAt: new Date(),
                createdBy: user.email,
                submissions: [],
                status: 'active'
            };

            setTasks([...tasks, newTask]);
            setShowCreateTask(false);

            Swal.fire('Success!', 'Task created successfully.', 'success');
        } catch (error) {
            console.error('Error creating task:', error);
            Swal.fire('Error!', 'Failed to create task.', 'error');
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        const result = await Swal.fire({
            title: 'Delete Task?',
            text: 'This will remove the task and all submissions.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setTasks(tasks.filter(task => task.id !== taskId));
            Swal.fire('Deleted!', 'Task has been deleted.', 'success');
        }
    };

    // Get task status based on due date
    const getTaskStatus = (task) => {
        const now = new Date();
        const dueDate = new Date(task.dueDate);

        if (task.status === 'completed') return 'completed';
        if (now > dueDate) return 'overdue';
        if (now.getTime() - dueDate.getTime() < 24 * 60 * 60 * 1000) return 'due-soon';
        return 'active';
    };

    // Filter tasks
    const filteredTasks = filterStatus === 'all'
        ? tasks
        : tasks.filter(task => getTaskStatus(task) === filterStatus);

    const taskStats = {
        total: tasks.length,
        active: tasks.filter(task => getTaskStatus(task) === 'active').length,
        overdue: tasks.filter(task => getTaskStatus(task) === 'overdue').length,
        completed: tasks.filter(task => getTaskStatus(task) === 'completed').length
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Tasks - {classroom?.name}</title>
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
                                            Tasks & Assignments - {classroom?.name}
                                        </h1>
                                        <p className="text-gray-600">Create and manage assignments for your students</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateTask(true)}
                                        className="flex items-center px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold shadow-lg"
                                    >
                                        <MdAdd className="mr-2" />
                                        Create Task
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats and Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterStatus === 'all'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MdAssignment className="text-blue-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Total Tasks</p>
                                        <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterStatus('active')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterStatus === 'active'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <MdCheckCircle className="text-green-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-gray-900">{taskStats.active}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterStatus('overdue')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterStatus === 'overdue'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <MdWarning className="text-red-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Overdue</p>
                                        <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterStatus('completed')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterStatus === 'completed'
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MdPending className="text-purple-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
                                    </div>
                                </div>
                            </button>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">Average Grade</p>
                                    <p className="text-2xl font-bold text-gray-900">85%</p>
                                </div>
                            </div>
                        </div>

                        {/* Tasks List */}
                        {filteredTasks.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <MdAssignment className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                                    {filterStatus === 'all' ? 'No Tasks Yet' : `No ${filterStatus} Tasks`}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {filterStatus === 'all'
                                        ? 'Create your first assignment to get started.'
                                        : `No tasks match the ${filterStatus} filter.`
                                    }
                                </p>
                                {filterStatus === 'all' && (
                                    <button
                                        onClick={() => setShowCreateTask(true)}
                                        className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold"
                                    >
                                        Create First Task
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        status={getTaskStatus(task)}
                                        onDelete={deleteTask}
                                        studentCount={classroom?.students?.length || 0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && (
                <CreateTaskModal
                    onClose={() => setShowCreateTask(false)}
                    onSubmit={createTask}
                />
            )}
        </div>
    );
};

// Task Card Component
const TaskCard = ({ task, status, onDelete, studentCount }) => {
    const getStatusInfo = () => {
        switch (status) {
            case 'completed':
                return { color: 'bg-purple-100 text-purple-800', text: 'Completed' };
            case 'overdue':
                return { color: 'bg-red-100 text-red-800', text: 'Overdue' };
            case 'due-soon':
                return { color: 'bg-yellow-100 text-yellow-800', text: 'Due Soon' };
            default:
                return { color: 'bg-green-100 text-green-800', text: 'Active' };
        }
    };

    const statusInfo = getStatusInfo();
    const submissionCount = task.submissions?.length || 0;
    const submissionPercentage = studentCount > 0 ? Math.round((submissionCount / studentCount) * 100) : 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-900 mr-3">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                        </span>
                    </div>
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                            <MdDateRange className="mr-1" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                            <MdGroup className="mr-1" />
                            <span>{submissionCount}/{studentCount} submitted</span>
                        </div>
                        <div className="flex items-center">
                            <MdSchedule className="mr-1" />
                            <span>{task.points || 0} points</span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <MdVisibility />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <MdEdit />
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <MdDelete />
                    </button>
                </div>
            </div>

            {/* Submission Progress */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Submissions</span>
                    <span>{submissionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${submissionPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors font-medium">
                    View Submissions
                </button>
                <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    Grade
                </button>
            </div>
        </div>
    );
};

// Create Task Modal
const CreateTaskModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'assignment',
        dueDate: '',
        points: 100,
        instructions: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title && formData.dueDate) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Create New Task</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g., Chapter 5 Assignment"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                                <option value="homework">Homework</option>
                                <option value="exam">Exam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Points
                            </label>
                            <input
                                type="number"
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="1"
                                max="1000"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Due Date *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Brief description of the task"
                                rows="3"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Instructions
                            </label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Detailed instructions for students..."
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-semibold"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TasksPage;
