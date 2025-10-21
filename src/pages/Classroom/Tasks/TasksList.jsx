import { useMemo } from 'react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

const TasksList = ({
    filteredTasks,
    filterStatus,
    userRole,
    classroom,
    classroomId,
    canCreateTask,
    isOwner,
    onCreateTask,
    onDeleteTask,
    onSubmitTask,
    userEmail,
    onViewSubmission,
    onViewAllSubmissions,
    onViewSubmissions, // 🆕 NEW PROP FOR UPDATED MODAL
    canViewSubmission,
    hasUserSubmitted,
    getUserSubmission,
    getSubmissionCount,
    allowsResubmission,
    refreshTrigger // 🆕 NEW PROP FOR REFRESH TRIGGER
}) => {
    // Memoize task processing to prevent unnecessary re-renders
    const processedTasks = useMemo(() => {
        // console.log('📋 TasksList: Processing tasks', {
        //     tasksCount: filteredTasks?.length || 0,
        //     filterStatus,
        //     refreshTrigger, // Include trigger in dependency tracking
        //     userRole,
        //     userEmail
        // }); 

        if (!filteredTasks || filteredTasks.length === 0) {
            return [];
        }

        return filteredTasks.map(task => ({
            ...task,
            // Ensure fresh data by including refresh trigger in processing
            _refreshKey: `${task._id || task.id}-${refreshTrigger}`,
            // Add any additional processing here
            submissionCount: getSubmissionCount ? getSubmissionCount(task) : (task.submissions?.length || 0),
            userHasSubmitted: hasUserSubmitted ? hasUserSubmitted(task, userEmail) : false,
            userSubmission: getUserSubmission ? getUserSubmission(task, userEmail) : null
        }));
    }, [filteredTasks, filterStatus, refreshTrigger, userRole, userEmail, getSubmissionCount, hasUserSubmitted, getUserSubmission]);

    const handleViewSubmissions = (task) => {
        // console.log('👁️ TasksList: View submissions clicked for task:', task._id || task.id);

        // Use the new ViewSubmissionModal handler if available, otherwise fall back to legacy
        if (onViewSubmissions) {
            onViewSubmissions(task);
        } else if (userRole === 'teacher' && onViewAllSubmissions) {
            onViewAllSubmissions(task._id || task.id);
        } else if (onViewSubmission) {
            onViewSubmission(task._id || task.id);
        }
    };

    if (!processedTasks || processedTasks.length === 0) {
        return (
            <EmptyState
                filterStatus={filterStatus}
                canCreateTask={canCreateTask}
                onCreateTask={onCreateTask}
                userRole={userRole}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    {filterStatus === 'all' ? 'All Tasks' :
                        filterStatus === 'pending' ? 'Pending Tasks' :
                            filterStatus === 'submitted' ? 'Submitted Tasks' :
                                filterStatus === 'graded' ? 'Graded Tasks' : 'Tasks'}
                    <span className="ml-2 text-sm text-gray-500">
                        ({processedTasks.length})
                    </span>
                </h3>
            </div>

            <div className="grid gap-6">
                {processedTasks.map((task, index) => (
                    <TaskCard
                        key={task._refreshKey || task._id || task.id || index} // 🔄 USE REFRESH KEY
                        task={task}
                        classroomId={classroomId}
                        userRole={userRole}
                        userEmail={userEmail}
                        canCreateTask={canCreateTask}
                        isOwner={isOwner}
                        onDeleteTask={onDeleteTask}
                        onSubmitTask={onSubmitTask}
                        onViewSubmissions={handleViewSubmissions} // 🔄 ENHANCED HANDLER
                        canViewSubmission={canViewSubmission}
                        hasUserSubmitted={hasUserSubmitted}
                        getUserSubmission={getUserSubmission}
                        getSubmissionCount={getSubmissionCount}
                        allowsResubmission={allowsResubmission}
                        // 🆕 PASS ADDITIONAL PROPS FOR BETTER REACTIVITY
                        refreshTrigger={refreshTrigger}
                    />
                ))}
            </div>
        </div>
    );
};

export default TasksList;
