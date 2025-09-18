import React, { useState } from 'react';
import {
    MdAssignment,
    MdSchedule,
    MdPerson,
    MdDelete,
    MdVisibility,
    MdEdit,
    MdCheckCircle
} from 'react-icons/md';
import SubmitTaskModal from './SubmitTaskModal';
import ViewSubmissionModal from './ViewSubmissionModal';

const TaskCard = ({
    task,
    classroomId,
    userRole,
    userEmail,
    canCreateTask,
    isOwner,
    onDeleteTask,
    onSubmitTask,
    onViewSubmission,
    onViewAllSubmissions,
    canViewSubmission,
    hasUserSubmitted,
    getUserSubmission,
    getSubmissionCount,
    allowsResubmission
}) => {
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showViewSubmissions, setShowViewSubmissions] = useState(false);

    // Safe prop checks with fallbacks
    const userSubmission = getUserSubmission ? getUserSubmission(task, userEmail) : null;
    const submissionCount = getSubmissionCount ? getSubmissionCount(task) : (task.submissions?.length || 0);
    const hasSubmitted = hasUserSubmitted ? hasUserSubmitted(task, userEmail) : false;
    const canResubmit = allowsResubmission ? allowsResubmission(task) : true;

    console.log('🔍 TaskCard Debug:', {
        taskId: task._id || task.id,
        taskTitle: task.title,
        userRole,
        isOwner,
        hasSubmitted,
        submissionCount,
        userSubmission,
        userEmail
    });

    // Handle view submissions - ALWAYS ensure this works
    const handleViewSubmissions = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🔘 View Submissions Clicked:', {
            taskId: task._id || task.id,
            classroomId,
            userRole,
            isOwner,
            hasSubmitted
        });

        // Force set state to show modal
        setShowViewSubmissions(true);
    };

    const handleSubmitTask = async (submissionData) => {
        if (!onSubmitTask) {
            console.error('onSubmitTask prop is missing');
            return;
        }

        const result = await onSubmitTask(task._id || task.id, submissionData, hasSubmitted);
        if (result?.success) {
            setShowSubmitModal(false);
        }
        return result;
    };

    const handleDeleteTask = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!onDeleteTask) {
            console.error('onDeleteTask prop is missing');
            return;
        }

        await onDeleteTask(task._id || task.id);
    };

    // Determine if view button should be shown
    const shouldShowViewButton = isOwner || hasSubmitted;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MdAssignment className="text-blue-600 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-gray-500 text-sm">
                            {task.type || 'Assignment'} • {task.points || 0} points
                        </p>
                    </div>
                </div>

                {/* Actions - FIXED VERSION */}
                <div className="flex items-center space-x-2">
                    {/* Delete Button (Owner Only) */}
                    {isOwner && (
                        <button
                            onClick={handleDeleteTask}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Task"
                            type="button"
                        >
                            <MdDelete className="text-lg" />
                        </button>
                    )}

                    {/* View Submissions Button - ALWAYS CLICKABLE WHEN CONDITIONS MET */}
                    {shouldShowViewButton && (
                        <button
                            onClick={handleViewSubmissions}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer font-medium"
                            title={isOwner ? `View all ${submissionCount} submissions` : 'View your submission'}
                            type="button"
                            style={{
                                pointerEvents: 'auto',
                                zIndex: 1
                            }}
                        >
                            <MdVisibility className="mr-2 text-sm" />
                            {isOwner ? `All Submissions (${submissionCount})` : 'View Submission'}
                        </button>
                    )}
                </div>
            </div>

            {/* Task Description */}
            {task.description && (
                <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
                </div>
            )}

            {/* Task Meta Information */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                {task.dueDate && (
                    <div className="flex items-center">
                        <MdSchedule className="mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                )}
                <div className="flex items-center">
                    <MdPerson className="mr-1" />
                    {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Debug:</strong> Role: {userRole}, Owner: {String(isOwner)},
                    Submitted: {String(hasSubmitted)}, Count: {submissionCount},
                    Show Button: {String(shouldShowViewButton)}
                </div>
            )}

            {/* Student Submission Status */}
            {userRole === 'student' && (
                <div className="border-t pt-4">
                    {hasSubmitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <MdCheckCircle className="text-green-500" />
                                    <div>
                                        <p className="text-green-800 font-medium">Submitted Successfully</p>
                                        <p className="text-green-600 text-sm">
                                            {userSubmission?.submittedAt
                                                ? new Date(userSubmission.submittedAt).toLocaleString()
                                                : 'Recently submitted'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Student Actions */}
                                <div className="flex space-x-2">
                                    {/* View Own Submission */}
                                    <button
                                        onClick={handleViewSubmissions}
                                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors"
                                        type="button"
                                    >
                                        <MdVisibility className="mr-1" />
                                        View
                                    </button>

                                    {/* Resubmit Option */}
                                    {canResubmit && (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm transition-colors"
                                            type="button"
                                        >
                                            <MdEdit className="mr-1" />
                                            Resubmit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            type="button"
                        >
                            Submit Assignment
                        </button>
                    )}
                </div>
            )}

            {/* Teacher View */}
            {userRole === 'teacher' && (
                <div className="border-t pt-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-800 font-medium">👨‍🏫 Teacher View</p>
                                <p className="text-purple-600 text-sm">
                                    {submissionCount > 0
                                        ? `${submissionCount} student${submissionCount !== 1 ? 's have' : ' has'} submitted`
                                        : 'No submissions yet'
                                    }
                                </p>
                            </div>

                            {/* Force Show View Button for Teachers */}
                            <button
                                onClick={handleViewSubmissions}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium"
                                type="button"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <MdVisibility className="mr-2" />
                                View All ({submissionCount})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showSubmitModal && (
                <SubmitTaskModal
                    task={task}
                    onClose={() => setShowSubmitModal(false)}
                    onSubmit={handleSubmitTask}
                    isResubmission={hasSubmitted}
                    existingSubmission={userSubmission}
                />
            )}

            {showViewSubmissions && (
                <ViewSubmissionModal
                    taskId={task._id || task.id}
                    classroomId={classroomId}
                    task={task}
                    isOpen={showViewSubmissions}
                    onClose={() => {
                        console.log('🔘 Closing ViewSubmissionModal');
                        setShowViewSubmissions(false);
                    }}
                    userRole={userRole}
                    userEmail={userEmail}
                />
            )}
        </div>
    );
};

export default TaskCard;
