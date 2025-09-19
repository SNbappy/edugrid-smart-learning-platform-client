import React, { useState, useEffect, useMemo } from 'react';
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
    MdBlock,
    MdRefresh
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
    onViewSubmissions, // 🆕 NEW PROP FOR ENHANCED MODAL
    canViewSubmission,
    hasUserSubmitted,
    getUserSubmission,
    getSubmissionCount,
    allowsResubmission,
    refreshTrigger = 0 // 🆕 NEW PROP FOR REACTIVE UPDATES
}) => {
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showViewSubmissions, setShowViewSubmissions] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 🔄 MEMOIZED CALCULATIONS FOR BETTER PERFORMANCE
    const calculatedData = useMemo(() => {
        const userSubmission = getUserSubmission ? getUserSubmission(task, userEmail) : null;
        const submissionCount = getSubmissionCount ? getSubmissionCount(task) : (task.submissions?.length || 0);
        const hasSubmitted = hasUserSubmitted ? hasUserSubmitted(task, userEmail) : false;

        // Enhanced deadline and grading checks
        const now = new Date();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate ? now > dueDate : false;
        const isGraded = userSubmission?.grade !== null && userSubmission?.grade !== undefined;
        const canSubmit = !isOverdue || userRole === 'teacher';
        const canResubmit = hasSubmitted && !isGraded && canSubmit;

        return {
            userSubmission,
            submissionCount,
            hasSubmitted,
            now,
            dueDate,
            isOverdue,
            isGraded,
            canSubmit,
            canResubmit
        };
    }, [task, userEmail, getUserSubmission, getSubmissionCount, hasUserSubmitted, userRole, refreshTrigger]);

    // 🆕 EFFECT TO LOG REFRESH TRIGGERS
    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log('🔄 TaskCard: Refresh triggered', {
                taskId: task._id || task.id,
                taskTitle: task.title,
                refreshTrigger,
                isGraded: calculatedData.isGraded,
                grade: calculatedData.userSubmission?.grade
            });
        }
    }, [refreshTrigger, task._id, task.id, task.title, calculatedData.isGraded, calculatedData.userSubmission?.grade]);

    console.log('🔍 TaskCard Debug:', {
        taskId: task._id || task.id,
        taskTitle: task.title,
        userRole,
        isOwner,
        hasSubmitted: calculatedData.hasSubmitted,
        submissionCount: calculatedData.submissionCount,
        userSubmission: calculatedData.userSubmission,
        userEmail,
        isOverdue: calculatedData.isOverdue,
        isGraded: calculatedData.isGraded,
        canSubmit: calculatedData.canSubmit,
        canResubmit: calculatedData.canResubmit,
        grade: calculatedData.userSubmission?.grade,
        refreshTrigger
    });

    // 🔄 ENHANCED VIEW SUBMISSIONS HANDLER
    const handleViewSubmissions = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('🔘 View Submissions Clicked:', {
            taskId: task._id || task.id,
            classroomId,
            userRole,
            isOwner,
            hasSubmitted: calculatedData.hasSubmitted,
            hasOnViewSubmissions: !!onViewSubmissions
        });

        // 🆕 PRIORITY: Use new enhanced modal if available
        if (onViewSubmissions) {
            console.log('✅ Using enhanced ViewSubmissionModal via onViewSubmissions');
            onViewSubmissions(task);
        } else {
            // Fallback to local modal state
            console.log('📋 Using local ViewSubmissionModal state');
            setShowViewSubmissions(true);
        }
    };

    // 🔄 ENHANCED SUBMIT TASK HANDLER WITH LOADING STATE
    const handleSubmitTask = async (submissionData) => {
        if (!onSubmitTask) {
            console.error('❌ onSubmitTask prop is missing');
            return { success: false, error: 'Submit handler not available' };
        }

        try {
            setIsRefreshing(true);
            console.log('📤 TaskCard: Submitting task', {
                taskId: task._id || task.id,
                hasSubmitted: calculatedData.hasSubmitted
            });

            const result = await onSubmitTask(task._id || task.id, submissionData, calculatedData.hasSubmitted);

            if (result?.success) {
                console.log('✅ TaskCard: Task submitted successfully');
                setShowSubmitModal(false);
            } else {
                console.error('❌ TaskCard: Task submission failed:', result?.error);
            }

            return result;
        } catch (error) {
            console.error('❌ TaskCard: Submit error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsRefreshing(false);
        }
    };

    // 🔄 ENHANCED DELETE TASK HANDLER
    const handleDeleteTask = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!onDeleteTask) {
            console.error('❌ onDeleteTask prop is missing');
            return;
        }

        try {
            setIsRefreshing(true);
            console.log('🗑️ TaskCard: Deleting task', { taskId: task._id || task.id });

            await onDeleteTask(task._id || task.id);

            console.log('✅ TaskCard: Task deleted successfully');
        } catch (error) {
            console.error('❌ TaskCard: Delete error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Determine if view button should be shown
    const shouldShowViewButton = isOwner || calculatedData.hasSubmitted;

    // 🆕 ENHANCED STATUS INFO FUNCTION
    const getTaskStatusInfo = () => {
        if (userRole !== 'student') return null;

        const { hasSubmitted, isGraded, isOverdue, dueDate, now, userSubmission } = calculatedData;

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
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${isRefreshing ? 'opacity-70' : ''}`}>
            {/* 🆕 REFRESH INDICATOR */}
            {isRefreshing && (
                <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        <MdRefresh className="animate-spin" />
                        <span>Updating...</span>
                    </div>
                </div>
            )}

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
                            {/* Show overdue indicator */}
                            {calculatedData.isOverdue && userRole === 'student' && (
                                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                    OVERDUE
                                </span>
                            )}
                            {/* 🆕 Show refresh indicator */}
                            {refreshTrigger > 0 && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                    UPDATED
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
                            disabled={isRefreshing}
                        >
                            <MdDelete className="text-lg" />
                        </button>
                    )}

                    {/* View Submissions Button */}
                    {shouldShowViewButton && (
                        <button
                            onClick={handleViewSubmissions}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isOwner ? `View all ${calculatedData.submissionCount} submissions` : 'View your submission'}
                            type="button"
                            disabled={isRefreshing}
                            style={{
                                pointerEvents: 'auto',
                                zIndex: 1
                            }}
                        >
                            <MdVisibility className="mr-2 text-sm" />
                            {isOwner ? `All Submissions (${calculatedData.submissionCount})` : 'View Submission'}
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
                    <div className={`flex items-center ${calculatedData.isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        <MdSchedule className="mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {calculatedData.isOverdue && <span className="ml-1">(Overdue)</span>}
                    </div>
                )}
                <div className="flex items-center">
                    <MdPerson className="mr-1" />
                    {calculatedData.submissionCount} submission{calculatedData.submissionCount !== 1 ? 's' : ''}
                </div>
            </div>

            {/* 🆕 ENHANCED STUDENT GRADE DISPLAY WITH ANIMATION */}
            {userRole === 'student' && calculatedData.isGraded && (
                <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg animate-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${parseFloat(calculatedData.userSubmission.grade) >= 90 ? 'bg-green-500' :
                                    parseFloat(calculatedData.userSubmission.grade) >= 80 ? 'bg-blue-500' :
                                        parseFloat(calculatedData.userSubmission.grade) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>
                                {Math.round(parseFloat(calculatedData.userSubmission.grade))}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Grade: {calculatedData.userSubmission.grade}/100
                                </p>
                                <p className="text-sm text-gray-600">
                                    Graded by {calculatedData.userSubmission.gradedBy} on{' '}
                                    {calculatedData.userSubmission.gradedAt ? new Date(calculatedData.userSubmission.gradedAt).toLocaleDateString() : 'N/A'}
                                </p>
                                {calculatedData.userSubmission.feedback && (
                                    <p className="text-sm text-gray-700 mt-1 italic">
                                        "{calculatedData.userSubmission.feedback}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <MdGrade className="text-purple-500 text-2xl animate-pulse" />
                    </div>

                    {/* 🆕 NEW GRADE RECEIVED INDICATOR */}
                    {refreshTrigger > 0 && calculatedData.isGraded && (
                        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded text-center">
                            <span className="text-green-800 text-sm font-medium">
                                ✨ Grade just received!
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <strong>Debug:</strong> Role: {userRole}, Owner: {String(isOwner)},
                    Submitted: {String(calculatedData.hasSubmitted)}, Count: {calculatedData.submissionCount},
                    Show Button: {String(shouldShowViewButton)}, Overdue: {String(calculatedData.isOverdue)},
                    Graded: {String(calculatedData.isGraded)}, Can Submit: {String(calculatedData.canSubmit)},
                    Can Resubmit: {String(calculatedData.canResubmit)}, Refresh: {refreshTrigger},
                    Has Enhanced Modal: {String(!!onViewSubmissions)}
                </div>
            )}

            {/* Student Submission Status */}
            {userRole === 'student' && (
                <div className="border-t pt-4">
                    {calculatedData.hasSubmitted ? (
                        <div className={`border rounded-lg p-4 transition-colors duration-300 ${calculatedData.isGraded ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {statusInfo && <statusInfo.icon className={`text-${statusInfo.color}-500`} />}
                                    <div>
                                        <p className={`font-medium ${calculatedData.isGraded ? 'text-purple-800' : 'text-green-800'
                                            }`}>
                                            {statusInfo?.message || 'Submitted Successfully'}
                                        </p>
                                        <p className={`text-sm ${calculatedData.isGraded ? 'text-purple-600' : 'text-green-600'
                                            }`}>
                                            {calculatedData.userSubmission?.submittedAt
                                                ? new Date(calculatedData.userSubmission.submittedAt).toLocaleString()
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
                                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors disabled:opacity-50"
                                        type="button"
                                        disabled={isRefreshing}
                                    >
                                        <MdVisibility className="mr-1" />
                                        View
                                    </button>

                                    {/* Resubmit with restrictions */}
                                    {calculatedData.canResubmit ? (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded text-sm transition-colors disabled:opacity-50"
                                            type="button"
                                            disabled={isRefreshing}
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
                                                calculatedData.isGraded ? 'Cannot resubmit - already graded' :
                                                    calculatedData.isOverdue ? 'Cannot resubmit - deadline passed' :
                                                        'Resubmission not allowed'
                                            }
                                        >
                                            <MdBlock className="mr-1" />
                                            {calculatedData.isGraded ? 'Graded' : 'Overdue'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Submit button with deadline check
                        <div>
                            {calculatedData.canSubmit ? (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="button"
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <MdRefresh className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Submit Assignment'
                                    )}
                                </button>
                            ) : (
                                <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 rounded-lg text-center font-medium">
                                    <div className="flex items-center justify-center space-x-2">
                                        <MdWarning />
                                        <span>Submission Deadline Passed</span>
                                    </div>
                                    <p className="text-sm text-red-600 mt-1">
                                        Due: {calculatedData.dueDate ? calculatedData.dueDate.toLocaleDateString() : 'N/A'}
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
                                    {calculatedData.submissionCount > 0
                                        ? `${calculatedData.submissionCount} student${calculatedData.submissionCount !== 1 ? 's have' : ' has'} submitted`
                                        : 'No submissions yet'
                                    }
                                    {/* Show overdue status for teachers */}
                                    {calculatedData.isOverdue && (
                                        <span className="ml-2 text-red-600 font-medium">
                                            • Task is overdue
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Force Show View Button for Teachers */}
                            <button
                                onClick={handleViewSubmissions}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium disabled:opacity-50"
                                type="button"
                                disabled={isRefreshing}
                                style={{ pointerEvents: 'auto' }}
                            >
                                <MdVisibility className="mr-2" />
                                View All ({calculatedData.submissionCount})
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
                    isResubmission={calculatedData.hasSubmitted}
                    existingSubmission={calculatedData.userSubmission}
                    isOverdue={calculatedData.isOverdue}
                    canSubmit={calculatedData.canSubmit}
                />
            )}

            {/* 🔄 CONDITIONAL MODAL RENDERING - Only show if not using enhanced parent modal */}
            {showViewSubmissions && !onViewSubmissions && (
                <ViewSubmissionModal
                    taskId={task._id || task.id}
                    classroomId={classroomId}
                    task={task}
                    isOpen={showViewSubmissions}
                    onClose={() => {
                        console.log('🔘 Closing local ViewSubmissionModal');
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
