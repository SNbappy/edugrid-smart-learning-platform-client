import React from 'react';
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
    canViewSubmission,
    hasUserSubmitted,
    getUserSubmission,
    getSubmissionCount,
    allowsResubmission
}) => {
    console.log('📝 TasksList Props:', {
        tasksCount: filteredTasks.length,
        classroomId,
        userRole,
        isOwner,
        userEmail
    });

    if (filteredTasks.length === 0) {
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
            {filteredTasks.map((task) => (
                <TaskCard
                    key={task._id || task.id}
                    task={task}
                    classroomId={classroomId}
                    userRole={userRole}
                    userEmail={userEmail}
                    canCreateTask={canCreateTask}
                    isOwner={isOwner}
                    onDeleteTask={onDeleteTask}
                    onSubmitTask={onSubmitTask}
                    onViewSubmission={onViewSubmission}
                    onViewAllSubmissions={onViewAllSubmissions}
                    canViewSubmission={canViewSubmission}
                    hasUserSubmitted={hasUserSubmitted}
                    getUserSubmission={getUserSubmission}
                    getSubmissionCount={getSubmissionCount}
                    allowsResubmission={allowsResubmission}
                />
            ))}
        </div>
    );
};

export default TasksList;
