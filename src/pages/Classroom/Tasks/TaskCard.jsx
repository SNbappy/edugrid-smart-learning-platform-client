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
    MdRefresh,
    MdFileUpload
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
    onViewSubmissions,
    canViewSubmission,
    hasUserSubmitted,
    getUserSubmission,
    getSubmissionCount,
    allowsResubmission,
    refreshTrigger = 0
}) => {
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showViewSubmissions, setShowViewSubmissions] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Memoized calculations for better performance
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

    // Effect to log refresh triggers
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

    // Enhanced view submissions handler
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

        if (onViewSubmissions) {
            console.log('✅ Using enhanced ViewSubmissionModal via onViewSubmissions');
            onViewSubmissions(task);
        } else {
            console.log('📋 Using local ViewSubmissionModal state');
            setShowViewSubmissions(true);
        }
    };

    // Enhanced submit task handler with loading state
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

    // Enhanced delete task handler
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

    // Enhanced status info function
    const getTaskStatusInfo = () => {
        if (userRole !== 'student') return null;

        const { hasSubmitted, isGraded, isOverdue, dueDate, now, userSubmission } = calculatedData;

        if (hasSubmitted) {
            if (isGraded) {
                const grade = parseFloat(userSubmission.grade);
                const gradeColor = grade >= 90 ? 'emerald' : grade >= 80 ? 'blue' : grade >= 70 ? 'amber' : 'red';
                return {
                    type: 'graded',
                    color: gradeColor,
                    message: `Graded: ${grade}/100`,
                    icon: MdGrade
                };
            } else {
                return {
                    type: 'submitted',
                    color: 'emerald',
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
                    color: 'amber',
                    message: `Due in ${hoursLeft} hours`,
                    icon: MdAccessTime
                };
            } else {
                return {
                    type: 'urgent',
                    color: 'amber',
                    message: 'Due very soon',
                    icon: MdWarning
                };
            }
        }

        return {
            type: 'pending',
            color: 'slate',
            message: 'Not submitted',
            icon: MdAssignment
        };
    };

    const statusInfo = getTaskStatusInfo();

    return (
        <div className={`bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${isRefreshing ? 'opacity-70' : ''}`}>
            {/* Refresh Indicator */}
            {isRefreshing && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center space-x-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        <MdRefresh className="animate-spin w-3 h-3" />
                        <span>Updating...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MdAssignment className="text-purple-600 w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate">{task.title}</h3>
                            <div className="flex items-center flex-wrap gap-2 mt-1">
                                <span className="text-sm text-slate-600">
                                    {task.type || 'Assignment'} • {task.points || 0} points
                                </span>
                                {/* Status Badges */}
                                {calculatedData.isOverdue && userRole === 'student' && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                        OVERDUE
                                    </span>
                                )}
                                {refreshTrigger > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                        UPDATED
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                        {/* Delete Button (Owner Only) */}
                        {isOwner && (
                            <button
                                onClick={handleDeleteTask}
                                className="w-8 h-8 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                                title="Delete Task"
                                type="button"
                                disabled={isRefreshing}
                            >
                                <MdDelete className="w-4 h-4" />
                            </button>
                        )}

                        {/* View Submissions Button */}
                        {shouldShowViewButton && (
                            <button
                                onClick={handleViewSubmissions}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={isOwner ? `View all ${calculatedData.submissionCount} submissions` : 'View your submission'}
                                type="button"
                                disabled={isRefreshing}
                            >
                                <MdVisibility className="w-4 h-4 mr-1.5" />
                                {isOwner ? `${calculatedData.submissionCount}` : 'View'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Task Description */}
            {task.description && (
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-25">
                    <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">{task.description}</p>
                </div>
            )}

            {/* Task Meta Information */}
            <div className="px-6 py-3 border-b border-slate-100">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                        {task.dueDate && (
                            <div className={`flex items-center ${calculatedData.isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                <MdSchedule className="w-4 h-4 mr-1" />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                {calculatedData.isOverdue && <span className="ml-1 text-red-500">(Overdue)</span>}
                            </div>
                        )}
                        <div className="flex items-center text-slate-600">
                            <MdPerson className="w-4 h-4 mr-1" />
                            <span>{calculatedData.submissionCount} submission{calculatedData.submissionCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {/* Status Indicator for Students */}
                    {userRole === 'student' && statusInfo && (
                        <div className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                    statusInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                        statusInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                                            'bg-slate-100 text-slate-700'
                            }`}>
                            <statusInfo.icon className="w-3 h-3 mr-1" />
                            {statusInfo.message}
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Student Grade Display */}
            {userRole === 'student' && calculatedData.isGraded && (
                <div className="px-6 py-4 border-b border-slate-100">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${parseFloat(calculatedData.userSubmission.grade) >= 90 ? 'bg-emerald-500' :
                                        parseFloat(calculatedData.userSubmission.grade) >= 80 ? 'bg-blue-500' :
                                            parseFloat(calculatedData.userSubmission.grade) >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}>
                                    {Math.round(parseFloat(calculatedData.userSubmission.grade))}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        Grade: {calculatedData.userSubmission.grade}/100
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Graded by {calculatedData.userSubmission.gradedBy} on{' '}
                                        {calculatedData.userSubmission.gradedAt ? new Date(calculatedData.userSubmission.gradedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                    {calculatedData.userSubmission.feedback && (
                                        <p className="text-sm text-slate-700 mt-1 italic">
                                            "{calculatedData.userSubmission.feedback}"
                                        </p>
                                    )}
                                </div>
                            </div>
                            <MdGrade className="text-purple-500 text-2xl" />
                        </div>

                        {/* Grade Received Indicator */}
                        {refreshTrigger > 0 && calculatedData.isGraded && (
                            <div className="mt-3 p-2 bg-emerald-100 border border-emerald-200 rounded-lg text-center">
                                <span className="text-emerald-800 text-sm font-medium">
                                    ✨ Grade just received!
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Student Actions Section */}
            {userRole === 'student' && (
                <div className="px-6 py-4">
                    {calculatedData.hasSubmitted ? (
                        <div className={`border rounded-lg p-4 ${calculatedData.isGraded ? 'bg-purple-50 border-purple-200' : 'bg-emerald-50 border-emerald-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${calculatedData.isGraded ? 'bg-purple-100' : 'bg-emerald-100'
                                        }`}>
                                        {calculatedData.isGraded ? (
                                            <MdGrade className={calculatedData.isGraded ? 'text-purple-600' : 'text-emerald-600'} />
                                        ) : (
                                            <MdCheckCircle className="text-emerald-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-medium ${calculatedData.isGraded ? 'text-purple-800' : 'text-emerald-800'
                                            }`}>
                                            {calculatedData.isGraded ? 'Assignment Graded' : 'Submitted Successfully'}
                                        </p>
                                        <p className={`text-sm ${calculatedData.isGraded ? 'text-purple-600' : 'text-emerald-600'
                                            }`}>
                                            {calculatedData.userSubmission?.submittedAt
                                                ? new Date(calculatedData.userSubmission.submittedAt).toLocaleString()
                                                : 'Recently submitted'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleViewSubmissions}
                                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                        type="button"
                                        disabled={isRefreshing}
                                    >
                                        <MdVisibility className="w-4 h-4 mr-1" />
                                        View
                                    </button>

                                    {calculatedData.canResubmit ? (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                            type="button"
                                            disabled={isRefreshing}
                                        >
                                            <MdEdit className="w-4 h-4 mr-1" />
                                            Resubmit
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
                                            type="button"
                                            title={
                                                calculatedData.isGraded ? 'Cannot resubmit - already graded' :
                                                    calculatedData.isOverdue ? 'Cannot resubmit - deadline passed' :
                                                        'Resubmission not allowed'
                                            }
                                        >
                                            <MdBlock className="w-4 h-4 mr-1" />
                                            {calculatedData.isGraded ? 'Graded' : 'Locked'}
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
                                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/25"
                                    type="button"
                                    disabled={isRefreshing}
                                >
                                    {isRefreshing ? (
                                        <>
                                            <MdRefresh className="animate-spin w-5 h-5 mr-2" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdFileUpload className="w-5 h-5 mr-2" />
                                            <span>Submit Assignment</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="w-full bg-red-50 border border-red-200 text-red-700 py-3 rounded-lg text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <MdWarning className="w-5 h-5" />
                                        <span className="font-medium">Submission Deadline Passed</span>
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
                <div className="px-6 py-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MdPerson className="text-blue-600 w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-blue-800 font-medium">👨‍🏫 Teacher View</p>
                                    <p className="text-blue-600 text-sm">
                                        {calculatedData.submissionCount > 0
                                            ? `${calculatedData.submissionCount} student${calculatedData.submissionCount !== 1 ? 's have' : ' has'} submitted`
                                            : 'No submissions yet'
                                        }
                                        {calculatedData.isOverdue && (
                                            <span className="ml-2 text-red-600 font-medium">
                                                • Task is overdue
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleViewSubmissions}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                type="button"
                                disabled={isRefreshing}
                            >
                                <MdVisibility className="w-4 h-4 mr-2" />
                                View All ({calculatedData.submissionCount})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Info (Development Only) */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="px-6 py-3 border-t border-slate-100">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                        <strong>Debug:</strong> Role: {userRole}, Owner: {String(isOwner)},
                        Submitted: {String(calculatedData.hasSubmitted)}, Count: {calculatedData.submissionCount},
                        Show Button: {String(shouldShowViewButton)}, Overdue: {String(calculatedData.isOverdue)},
                        Graded: {String(calculatedData.isGraded)}, Can Submit: {String(calculatedData.canSubmit)},
                        Can Resubmit: {String(calculatedData.canResubmit)}, Refresh: {refreshTrigger},
                        Has Enhanced Modal: {String(!!onViewSubmissions)}
                    </div>
                </div>
            )} */}

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

            {/* Conditional modal rendering - Only show if not using enhanced parent modal */}
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
