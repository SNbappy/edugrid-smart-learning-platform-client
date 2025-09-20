import { useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from '../../Dashboard/Dashboard/Sidebar';
import TasksList from './TasksList';
import CreateTaskModal from './CreateTaskModal';
import SubmissionViewModal from './SubmissionViewModal';
import AllSubmissionsModal from './AllSubmissionsModal';
import ViewSubmissionModal from './ViewSubmissionModal';
import { useTasksLogic } from '../hooks/useTasksLogic';
import {
    MdArrowBack,
    MdAdd,
    MdAssignment,
    MdPeople,
    MdSchedule,
    MdCheckCircle,
    MdGrade,
    MdWarning,
    MdHourglassEmpty,
    MdPlayArrow,
    MdDelete
} from 'react-icons/md';

const TasksPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const {
        classroom,
        tasks,
        isLoading,
        showCreateTask,
        setShowCreateTask,
        filterStatus,
        setFilterStatus,
        userRole,
        createTask,
        deleteTask,
        submitTask,
        isOwner,
        refreshTasks,
        // Submission-related returns
        showSubmissionView,
        setShowSubmissionView,
        selectedSubmission,
        showAllSubmissionsView,
        setShowAllSubmissionsView,
        allSubmissions,
        viewSubmission,
        viewAllSubmissions,
        canViewSubmission,
        hasUserSubmitted,
        getUserSubmission,
        getSubmissionCount,
        allowsResubmission
    } = useTasksLogic(user, classroomId, axiosPublic, loading);

    // Enhanced state management for grade synchronization
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);
    const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);

    // Delete confirmation modal states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Permission check using backend data
    const canCreateTask = useMemo(() => {
        if (!user || !classroom) {
            return false;
        }
        return isOwner?.() || userRole === 'teacher';
    }, [user, classroom, userRole, isOwner]);

    // Task status determination function - UPDATED FOR ROLE-SPECIFIC LOGIC
    const getTaskStatus = useCallback((task, userEmail, userRole) => {
        const now = new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate ? now > dueDate : false;
        const submissionCount = getSubmissionCount ? getSubmissionCount(task) : (task.submissions?.length || 0);

        if (userRole === 'student') {
            // Student-specific status logic
            const userSubmission = getUserSubmission ? getUserSubmission(task, userEmail) : null;
            const hasSubmitted = hasUserSubmitted ? hasUserSubmitted(task, userEmail) : false;
            const isGraded = userSubmission?.grade !== null && userSubmission?.grade !== undefined;

            if (isOverdue) {
                return 'overdue';
            } else if (isGraded) {
                return 'graded';
            } else if (hasSubmitted) {
                return 'completed';
            } else {
                return 'pending';
            }
        } else {
            // Teacher-specific status logic - REMOVED ACTIVE STATUS
            if (isOverdue) {
                return 'overdue';
            } else if (submissionCount === 0) {
                return 'needs-grading'; // Changed from 'active' to 'needs-grading'
            } else {
                // Check if any submissions need grading
                const hasUngradedSubmissions = task.submissions?.some(sub =>
                    sub.grade === null || sub.grade === undefined
                ) || false;

                if (hasUngradedSubmissions) {
                    return 'needs-grading';
                } else {
                    return 'graded'; // All submissions are graded
                }
            }
        }
    }, [getUserSubmission, hasUserSubmitted, getSubmissionCount]);

    // Updated filteredTasks logic
    const filteredTasks = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) return [];

        return tasks.filter(task => {
            if (filterStatus === 'all') return true;

            const taskStatus = getTaskStatus(task, user?.email, userRole);
            return taskStatus === filterStatus;
        });
    }, [tasks, filterStatus, getTaskStatus, user?.email, userRole]);

    // Updated taskStats calculation with role-specific stats - REMOVED ACTIVE
    const taskStats = useMemo(() => {
        if (!tasks || !Array.isArray(tasks)) {
            if (userRole === 'student') {
                return { total: 0, pending: 0, completed: 0, graded: 0, overdue: 0 };
            } else {
                return { total: 0, 'needs-grading': 0, graded: 0, overdue: 0 }; // Removed active
            }
        }

        let stats;
        if (userRole === 'student') {
            stats = { total: tasks.length, pending: 0, completed: 0, graded: 0, overdue: 0 };
        } else {
            stats = { total: tasks.length, 'needs-grading': 0, graded: 0, overdue: 0 }; // Removed active
        }

        tasks.forEach(task => {
            const status = getTaskStatus(task, user?.email, userRole);
            stats[status] = (stats[status] || 0) + 1;
        });

        return stats;
    }, [tasks, getTaskStatus, user?.email, userRole]);

    // Enhanced submit task handler with refresh
    const handleSubmitTask = async (taskId, submissionData, isResubmission = false) => {
        try {
            console.log('🎯 TasksPage: Submitting task', { taskId, isResubmission });

            const result = await submitTask(taskId, submissionData, isResubmission);
            if (result?.success) {
                console.log('✅ TasksPage: Task submitted, triggering refresh');
                setRefreshTrigger(prev => prev + 1);

                // Refresh tasks to get updated submission data
                if (refreshTasks) {
                    await refreshTasks();
                }
            }
            return result;
        } catch (error) {
            console.error('❌ TasksPage: Error in handleSubmitTask:', error);
            return { success: false, error: error.message };
        }
    };

    // Grade submission callback - key for synchronization
    const handleGradeSubmitted = useCallback(async (gradeData) => {
        console.log('📢 TasksPage: Grade submitted callback received:', gradeData);

        try {
            // Trigger tasks refresh to update TaskCard displays
            if (refreshTasks) {
                console.log('🔄 TasksPage: Refreshing tasks after grading');
                await refreshTasks();
            }

            // Update refresh trigger for any other components
            setRefreshTrigger(prev => prev + 1);

            console.log('✅ TasksPage: Grade synchronization completed');

        } catch (error) {
            console.error('❌ TasksPage: Error in grade callback:', error);
        }
    }, [refreshTasks]);

    // Task update callback for general task refresh
    const handleTaskUpdate = useCallback(async (taskId, classroomId) => {
        console.log('🔄 TasksPage: Task update callback', { taskId, classroomId });

        try {
            if (refreshTasks) {
                await refreshTasks();
            }
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('❌ TasksPage: Error in task update callback:', error);
        }
    }, [refreshTasks]);

    // View submissions handler for new modal
    const handleViewSubmissions = useCallback((task) => {
        console.log('👁️ TasksPage: Opening ViewSubmissionModal for task:', task._id || task.id);
        setSelectedTaskForSubmissions(task);
        setShowViewSubmissionModal(true);
    }, []);

    // ✅ IMPROVED DELETE TASK HANDLER - PREVENTS DUPLICATE MODALS
    const handleDeleteTask = useCallback((taskId) => {
        // Input validation
        if (!taskId) {
            console.error('❌ TasksPage: Invalid taskId provided');
            return;
        }

        // Prevent duplicate calls
        if (isDeleting || showDeleteConfirm) {
            console.log('🚫 TasksPage: Delete already in progress or modal already shown');
            return;
        }

        // Find the task to show in confirmation
        const task = tasks.find(t => (t._id || t.id) === taskId);
        if (!task) {
            console.error('❌ TasksPage: Task not found');
            return;
        }

        console.log('🗑️ TasksPage: Initiating delete confirmation for task:', task.title);
        setTaskToDelete({ id: taskId, title: task.title });
        setShowDeleteConfirm(true);
    }, [tasks, isDeleting, showDeleteConfirm]);

    // ✅ EXECUTE DELETE WITH PROPER ERROR HANDLING
    const executeDelete = async () => {
        if (!taskToDelete) return;

        try {
            setIsDeleting(true);
            console.log('🗑️ TasksPage: Executing delete for task:', taskToDelete.id);

            const result = await deleteTask(taskToDelete.id);

            if (result?.success) {
                console.log('✅ TasksPage: Task deleted successfully');

                // Close modal and reset state
                setShowDeleteConfirm(false);
                setTaskToDelete(null);

                // Refresh data
                if (refreshTasks) {
                    await refreshTasks();
                }
                setRefreshTrigger(prev => prev + 1);

                console.log('✅ Task deleted successfully!');
            } else {
                const errorMessage = result?.error || 'Failed to delete task';
                console.error('❌ TasksPage: Delete failed:', errorMessage);
            }

        } catch (error) {
            console.error('❌ TasksPage: Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // ✅ CANCEL DELETE
    const cancelDelete = () => {
        if (isDeleting) return; // Prevent canceling during deletion
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
    };

    // Loading state
    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 ml-[320px] flex items-center justify-center">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Tasks</h3>
                            <p className="text-slate-600">Please wait while we fetch your classroom tasks...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>Tasks - {classroom?.name} | EduGrid</title>
                <meta name="description" content={`Manage tasks for ${classroom?.name} classroom`} />
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px]">
                    {/* Professional Header */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-6 sm:px-8">
                            <div className="flex items-center justify-between h-16">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => navigate(`/classroom/${classroomId}`)}
                                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                                    >
                                        <MdArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="text-sm font-medium">Back to Classroom</span>
                                    </button>

                                    <div className="h-6 w-px bg-slate-300"></div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <MdAssignment className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                {classroom?.name}
                                            </h1>
                                            <p className="text-xs text-slate-500 -mt-0.5">Task Management</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isOwner?.()
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {isOwner?.() ? '👨‍🏫 Teacher Access' : '👨‍🎓 Student View'}
                                        </span>

                                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                            <MdPeople className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{classroom?.students?.length || 0}</span>
                                            <span className="ml-1">students</span>
                                        </div>
                                    </div>

                                    {canCreateTask && (
                                        <button
                                            onClick={() => setShowCreateTask(true)}
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-purple-600/25"
                                        >
                                            <MdAdd className="w-4 h-4 mr-2" />
                                            New Task
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
                        {/* Professional Stats Grid - ONE LINE LAYOUT WITH 4 CARDS FOR TEACHERS */}
                        <div className={`grid ${userRole === 'student' ? 'grid-cols-5' : 'grid-cols-4'} gap-4 mb-8`}>
                            {/* Total Tasks Card - Clickable */}
                            <div
                                className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'all' ? 'border-purple-300 ring-2 ring-purple-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterStatus('all')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MdAssignment className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900">
                                            {taskStats?.total || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Total</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Conditional Stats Cards Based on Role */}
                            {userRole === 'student' ? (
                                <>
                                    {/* Pending Tasks Card - Student */}
                                    <div
                                        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'pending' ? 'border-amber-300 ring-2 ring-amber-200' : 'border-slate-200'
                                            }`}
                                        onClick={() => setFilterStatus(filterStatus === 'pending' ? 'all' : 'pending')}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <MdSchedule className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    {taskStats?.pending || 0}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">Pending</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${taskStats?.total ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Completed Tasks Card - Student */}
                                    <div
                                        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'completed' ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-slate-200'
                                            }`}
                                        onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <MdCheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    {taskStats?.completed || 0}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">Submitted</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${taskStats?.total ? (taskStats.completed / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Graded Tasks Card - Student */}
                                    <div
                                        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'graded' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-slate-200'
                                            }`}
                                        onClick={() => setFilterStatus(filterStatus === 'graded' ? 'all' : 'graded')}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MdGrade className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    {taskStats?.graded || 0}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">Graded</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${taskStats?.total ? (taskStats.graded / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Needs Grading Tasks Card - Teacher */}
                                    <div
                                        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'needs-grading' ? 'border-amber-300 ring-2 ring-amber-200' : 'border-slate-200'
                                            }`}
                                        onClick={() => setFilterStatus(filterStatus === 'needs-grading' ? 'all' : 'needs-grading')}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <MdHourglassEmpty className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    {taskStats?.['needs-grading'] || 0}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">To Grade</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-amber-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${taskStats?.total ? (taskStats['needs-grading'] / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Graded Tasks Card - Teacher */}
                                    <div
                                        className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'graded' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-slate-200'
                                            }`}
                                        onClick={() => setFilterStatus(filterStatus === 'graded' ? 'all' : 'graded')}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MdGrade className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-slate-900">
                                                    {taskStats?.graded || 0}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">Graded</div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${taskStats?.total ? (taskStats.graded / taskStats.total) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Overdue Tasks Card - Common for Both Roles */}
                            <div
                                className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterStatus === 'overdue' ? 'border-red-300 ring-2 ring-red-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterStatus(filterStatus === 'overdue' ? 'all' : 'overdue')}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <MdWarning className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-slate-900">
                                            {taskStats?.overdue || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Overdue</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                        className="bg-red-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${taskStats?.total ? (taskStats.overdue / taskStats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks Section */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900">Classroom Tasks</h2>
                                    <div className="flex items-center space-x-4">
                                        {tasks && tasks.length > 0 && (
                                            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                                {filteredTasks?.length || 0} task{filteredTasks?.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <label className="text-sm text-slate-600">Filter:</label>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                            >
                                                <option value="all">All Tasks</option>
                                                {userRole === 'student' ? (
                                                    <>
                                                        <option value="pending">Pending (Not Submitted)</option>
                                                        <option value="completed">Submitted (Awaiting Grade)</option>
                                                        <option value="graded">Graded (Has Marks)</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="needs-grading">Needs Grading</option>
                                                        <option value="graded">Fully Graded</option>
                                                    </>
                                                )}
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <TasksList
                                    filteredTasks={filteredTasks}
                                    filterStatus={filterStatus}
                                    userRole={userRole}
                                    classroom={classroom}
                                    classroomId={classroomId}
                                    canCreateTask={canCreateTask}
                                    isOwner={isOwner?.()}
                                    onCreateTask={() => setShowCreateTask(true)}
                                    onDeleteTask={handleDeleteTask}
                                    onSubmitTask={handleSubmitTask}
                                    userEmail={user?.email}
                                    onViewSubmission={viewSubmission}
                                    onViewAllSubmissions={viewAllSubmissions}
                                    onViewSubmissions={handleViewSubmissions}
                                    canViewSubmission={canViewSubmission}
                                    hasUserSubmitted={hasUserSubmitted}
                                    getUserSubmission={getUserSubmission}
                                    getSubmissionCount={getSubmissionCount}
                                    allowsResubmission={allowsResubmission}
                                    refreshTrigger={refreshTrigger}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ DELETE CONFIRMATION MODAL - PREVENTS DUPLICATE MODALS */}
            {showDeleteConfirm && taskToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={cancelDelete}
                    />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                <MdDelete className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Task
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete "<strong>{taskToDelete.title}</strong>"? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateTask && canCreateTask && (
                <CreateTaskModal
                    onClose={() => setShowCreateTask(false)}
                    onSubmit={async (taskData) => {
                        const result = await createTask(taskData);
                        if (result?.success) {
                            setShowCreateTask(false);
                            if (refreshTasks) {
                                await refreshTasks();
                            }
                        }
                        return result;
                    }}
                />
            )}

            {/* New View Submission Modal with Grade Callbacks */}
            {showViewSubmissionModal && selectedTaskForSubmissions && (
                <ViewSubmissionModal
                    taskId={selectedTaskForSubmissions._id || selectedTaskForSubmissions.id}
                    classroomId={classroomId}
                    task={selectedTaskForSubmissions}
                    isOpen={showViewSubmissionModal}
                    onClose={() => {
                        setShowViewSubmissionModal(false);
                        setSelectedTaskForSubmissions(null);
                    }}
                    userRole={userRole}
                    userEmail={user?.email}
                    onGradeSubmitted={handleGradeSubmitted}
                    onTaskUpdate={handleTaskUpdate}
                />
            )}

            {/* Legacy Modals - Keep for Compatibility */}
            {showSubmissionView && selectedSubmission && (
                <SubmissionViewModal
                    submission={selectedSubmission}
                    onClose={() => {
                        setShowSubmissionView(false);
                    }}
                    isOwner={isOwner?.()}
                    userRole={userRole}
                />
            )}

            {showAllSubmissionsView && allSubmissions && isOwner?.() && (
                <AllSubmissionsModal
                    allSubmissions={allSubmissions}
                    onClose={() => {
                        setShowAllSubmissionsView(false);
                    }}
                    classroomName={classroom?.name}
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default TasksPage;
