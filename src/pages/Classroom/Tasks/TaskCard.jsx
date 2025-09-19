import React, { useState } from 'react';
import {
    MdAssignment,
    MdSchedule,
    MdPerson,
    MdDelete,
    MdVisibility,
    MdEdit,
    MdCheckCircle,
    MdWarning,
    MdGrade,
    MdAccessTime,
    MdBlock
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

    // **NEW: Enhanced deadline and grading checks**
    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate ? now > dueDate : false;
    const isGraded = userSubmission?.grade !== null && userSubmission?.grade !== undefined;
    const canSubmit = !isOverdue || userRole === 'teacher'; // Teachers can submit even after deadline
    const canResubmit = hasSubmitted && !isGraded && canSubmit; // Can't resubmit if graded or overdue

    console.log('🔍 TaskCard Debug:', {
        taskId: task._id || task.id,
        taskTitle: task.title,
        userRole,
        isOwner,
        hasSubmitted,
        submissionCount,
        userSubmission,
        userEmail,
        isOverdue,
        isGraded,
        canSubmit,
        canResubmit,
        grade: userSubmission?.grade
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

    // **NEW: Get status color and message**
    const getTaskStatusInfo = () => {
        if (userRole !== 'student') return null;

        if (hasSubmitted) {
            if (isGraded) {
                const grade = parseFloat(userSubmission.grade);
                const gradeColor = grade >= 90 ? 'green' : grade >= 80 ? 'blue' : grade >= 70 ? 'yellow' : 'red';
                return {
                    type: 'graded',
                    color: gradeColor,
                    message: `Graded: ${grade}/100`,
                    icon: MdGrade
                };
            } else {
                return {
                    type: 'submitted',
                    color: 'green',
                    message: 'Submitted - Awaiting Grade',
                    icon: MdCheckCircle
                };
            }
        } else if (isOverdue) {
            return {
                type: 'overdue',
                color: 'red',
                message: 'Overdue - Cannot Submit',
                icon: MdWarning
            };
        } else if (dueDate) {
            const timeLeft = dueDate - now;
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const daysLeft = Math.floor(hoursLeft / 24);

            if (daysLeft > 1) {
                return {
                    type: 'pending',
                    color: 'blue',
                    message: `Due in ${daysLeft} days`,
                    icon: MdSchedule
                };
            } else if (hoursLeft > 0) {
                return {
                    type: 'urgent',
                    color: 'orange',
                    message: `Due in ${hoursLeft} hours`,
                    icon: MdAccessTime
                };
            } else {
                return {
                    type: 'urgent',
                    color: 'orange',
                    message: 'Due very soon',
                    icon: MdWarning
                };
            }
        }

        return {
            type: 'pending',
            color: 'blue',
            message: 'Not submitted',
            icon: MdAssignment
        };
    };

    const statusInfo = getTaskStatusInfo();

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
                            {/* **NEW: Show overdue indicator** */}
                            {isOverdue && userRole === 'student' && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    OVERDUE
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Actions */}
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

                    {/* View Submissions Button */}
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
                    <div className={`flex items-center ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        <MdSchedule className="mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue && <span className="ml-1">(Overdue)</span>}
                    </div>
                )}
                <div className="flex items-center">
                    <MdPerson className="mr-1" />
                    {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                </div>
            </div>

            {/* **NEW: Student Grade Display** */}
            {userRole === 'student' && isGraded && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${parseFloat(userSubmission.grade) >= 90 ? 'bg-green-500' :
                                    parseFloat(userSubmission.grade) >= 80 ? 'bg-blue-500' :
                                        parseFloat(userSubmission.grade) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                {Math.round(parseFloat(userSubmission.grade))}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Grade: {userSubmission.grade}/100</p>
                                <p className="text-sm text-gray-600">
                                    Graded by {userSubmission.gradedBy} on {' '}
                                    {userSubmission.gradedAt ? new Date(userSubmission.gradedAt).toLocaleDateString() : 'N/A'}
                                </p>
                                {userSubmission.feedback && (
                                    <p className="text-sm text-gray-700 mt-1 italic">"{userSubmission.feedback}"</p>
                                )}
                            </div>
                        </div>
                        <MdGrade className="text-purple-500 text-2xl" />
                    </div>
                </div>
            )}

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Debug:</strong> Role: {userRole}, Owner: {String(isOwner)},
                    Submitted: {String(hasSubmitted)}, Count: {submissionCount},
                    Show Button: {String(shouldShowViewButton)}, Overdue: {String(isOverdue)},
                    Graded: {String(isGraded)}, Can Submit: {String(canSubmit)}, Can Resubmit: {String(canResubmit)}
                </div>
            )}

            {/* Student Submission Status */}
            {userRole === 'student' && (
                <div className="border-t pt-4">
                    {hasSubmitted ? (
                        <div className={`border rounded-lg p-4 ${isGraded ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {statusInfo && <statusInfo.icon className={`text-${statusInfo.color}-500`} />}
                                    <div>
                                        <p className={`font-medium ${isGraded ? 'text-purple-800' : 'text-green-800'
                                            }`}>
                                            {statusInfo?.message || 'Submitted Successfully'}
                                        </p>
                                        <p className={`text-sm ${isGraded ? 'text-purple-600' : 'text-green-600'
                                            }`}>
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

                                    {/* **UPDATED: Resubmit with restrictions** */}
                                    {canResubmit ? (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm transition-colors"
                                            type="button"
                                        >
                                            <MdEdit className="mr-1" />
                                            Resubmit
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center px-3 py-1 bg-gray-100 text-gray-400 rounded text-sm cursor-not-allowed"
                                            type="button"
                                            title={
                                                isGraded ? 'Cannot resubmit - already graded' :
                                                    isOverdue ? 'Cannot resubmit - deadline passed' :
                                                        'Resubmission not allowed'
                                            }
                                        >
                                            <MdBlock className="mr-1" />
                                            {isGraded ? 'Graded' : 'Overdue'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // **UPDATED: Submit button with deadline check**
                        <div>
                            {canSubmit ? (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                    type="button"
                                >
                                    Submit Assignment
                                </button>
                            ) : (
                                <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 rounded-lg text-center font-medium">
                                    <div className="flex items-center justify-center space-x-2">
                                        <MdWarning />
                                        <span>Submission Deadline Passed</span>
                                    </div>
                                    <p className="text-sm text-red-600 mt-1">
                                        Due: {dueDate ? dueDate.toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
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
                                    {/* **NEW: Show overdue status for teachers** */}
                                    {isOverdue && (
                                        <span className="ml-2 text-red-600 font-medium">
                                            • Task is overdue
                                        </span>
                                    )}
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
                    isOverdue={isOverdue}
                    canSubmit={canSubmit}
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
