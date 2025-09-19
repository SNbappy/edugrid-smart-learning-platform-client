import { useContext, useMemo, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from '../../Dashboard/Dashboard/Sidebar';
import TasksHeader from './TasksHeader';
import TasksStats from './TasksStats';
import TasksList from './TasksList';
import CreateTaskModal from './CreateTaskModal';
import SubmissionViewModal from './SubmissionViewModal';
import AllSubmissionsModal from './AllSubmissionsModal';
import ViewSubmissionModal from './ViewSubmissionModal'; // 🆕 IMPORT UPDATED MODAL
import { useTasksLogic } from '../hooks/useTasksLogic';

const TasksPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
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
        taskStats,
        filteredTasks,
        createTask,
        deleteTask,
        submitTask,
        isOwner,
        refreshTasks, // 🆕 ENSURE THIS IS AVAILABLE FROM useTasksLogic
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

    // 🆕 ENHANCED STATE MANAGEMENT FOR GRADE SYNCHRONIZATION
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);
    const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);

    // Permission check using backend data
    const canCreateTask = useMemo(() => {
        if (!user || !classroom) {
            return false;
        }
        return isOwner?.() || userRole === 'teacher';
    }, [user, classroom, userRole, isOwner]);

    // 🆕 ENHANCED SUBMIT TASK HANDLER WITH REFRESH
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

    // 🆕 GRADE SUBMISSION CALLBACK - KEY FOR SYNCHRONIZATION
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

    // 🆕 TASK UPDATE CALLBACK FOR GENERAL TASK REFRESH
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

    // 🆕 VIEW SUBMISSIONS HANDLER FOR NEW MODAL
    const handleViewSubmissions = useCallback((task) => {
        console.log('👁️ TasksPage: Opening ViewSubmissionModal for task:', task._id || task.id);
        setSelectedTaskForSubmissions(task);
        setShowViewSubmissionModal(true);
    }, []);

    // 🆕 ENHANCED DELETE TASK WITH REFRESH
    const handleDeleteTask = async (taskId) => {
        try {
            const result = await deleteTask(taskId);
            if (result?.success) {
                console.log('✅ TasksPage: Task deleted, refreshing');
                if (refreshTasks) {
                    await refreshTasks();
                }
                setRefreshTrigger(prev => prev + 1);
            }
            return result;
        } catch (error) {
            console.error('❌ TasksPage: Error deleting task:', error);
            return { success: false, error: error.message };
        }
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
                        <TasksHeader
                            classroom={classroom}
                            classroomId={classroomId}
                            userRole={userRole}
                            canCreateTask={canCreateTask}
                            isOwner={isOwner?.()}
                            onCreateTask={() => setShowCreateTask(true)}
                        />

                        <TasksStats
                            taskStats={taskStats}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            userRole={userRole}
                            tasks={tasks}
                            userEmail={user?.email}
                            isOwner={isOwner?.()}
                        />

                        <TasksList
                            filteredTasks={filteredTasks}
                            filterStatus={filterStatus}
                            userRole={userRole}
                            classroom={classroom}
                            classroomId={classroomId}
                            canCreateTask={canCreateTask}
                            isOwner={isOwner?.()}
                            onCreateTask={() => setShowCreateTask(true)}
                            onDeleteTask={handleDeleteTask} // 🔄 ENHANCED HANDLER
                            onSubmitTask={handleSubmitTask} // 🔄 ENHANCED HANDLER
                            userEmail={user?.email}
                            onViewSubmission={viewSubmission}
                            onViewAllSubmissions={viewAllSubmissions}
                            onViewSubmissions={handleViewSubmissions} // 🆕 NEW HANDLER FOR UPDATED MODAL
                            canViewSubmission={canViewSubmission}
                            hasUserSubmitted={hasUserSubmitted}
                            getUserSubmission={getUserSubmission}
                            getSubmissionCount={getSubmissionCount}
                            allowsResubmission={allowsResubmission}
                            refreshTrigger={refreshTrigger} // 🆕 PASS REFRESH TRIGGER
                        />
                    </div>
                </div>
            </div>

            {/* Modals */}
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

            {/* 🆕 NEW VIEW SUBMISSION MODAL WITH GRADE CALLBACKS */}
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
                    onGradeSubmitted={handleGradeSubmitted} // 🔑 PASS GRADE CALLBACK
                    onTaskUpdate={handleTaskUpdate} // 🔑 PASS TASK UPDATE CALLBACK
                />
            )}

            {/* LEGACY MODALS - KEEP FOR COMPATIBILITY */}
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
