import { useContext, useMemo, useEffect, useState } from 'react';
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

    // Additional state for enhanced submission handling
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Permission check using backend data
    const canCreateTask = useMemo(() => {
        if (!user || !classroom) {
            return false;
        }
        return isOwner?.() || userRole === 'teacher';
    }, [user, classroom, userRole, isOwner]);

    // Enhanced submit task handler
    const handleSubmitTask = async (taskId, submissionData, isResubmission = false) => {
        try {
            const result = await submitTask(taskId, submissionData, isResubmission);
            if (result?.success) {
                setRefreshTrigger(prev => prev + 1);
            }
            return result;
        } catch (error) {
            console.error('Error in handleSubmitTask:', error);
            return { success: false };
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
                            isOwner={isOwner} // Make sure this is the function result, not the function itself
                            onCreateTask={() => setShowCreateTask(true)}
                            onDeleteTask={deleteTask}
                            onSubmitTask={handleSubmitTask}
                            userEmail={user?.email}
                            onViewSubmission={viewSubmission}
                            onViewAllSubmissions={viewAllSubmissions}
                            canViewSubmission={canViewSubmission}
                            hasUserSubmitted={hasUserSubmitted}
                            getUserSubmission={getUserSubmission}
                            getSubmissionCount={getSubmissionCount}
                            allowsResubmission={allowsResubmission}
                        />

                    </div>
                </div>
            </div>

            {/* Modals */}
            {showCreateTask && canCreateTask && (
                <CreateTaskModal
                    onClose={() => setShowCreateTask(false)}
                    onSubmit={createTask}
                />
            )}

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
