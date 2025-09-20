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
    MdFileUpload,
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


    // Enhanced view submissions handler
    const handleViewSubmissions = (e) => {
        e.preventDefault();
        e.stopPropagation();


        if (onViewSubmissions) {
            onViewSubmissions(task);
        } else {
            setShowViewSubmissions(true);
        }
    };


    // Enhanced submit task handler with loading state
    const handleSubmitTask = async (submissionData) => {
        if (!onSubmitTask) {
            return { success: false, error: 'Submit handler not available' };
        }


        try {
            setIsRefreshing(true);
            const result = await onSubmitTask(task._id || task.id, submissionData, calculatedData.hasSubmitted);


            if (result?.success) {
                setShowSubmitModal(false);
            }


            return result;
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsRefreshing(false);
        }
    };


    // Enhanced delete task handler
    const handleDeleteTask = async (e) => {
        e.preventDefault();
        e.stopPropagation();


        if (!onDeleteTask) return;


        try {
            setIsRefreshing(true);
            await onDeleteTask(task._id || task.id);
        } catch (error) {
            console.error('❌ TaskCard: Delete error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };


    // Get status badge
    const getStatusBadge = () => {
        if (userRole !== 'student') return null;


        const { hasSubmitted, isGraded, isOverdue, userSubmission } = calculatedData;


        if (isOverdue && !hasSubmitted) {
            return { color: 'bg-red-100 text-red-700', text: 'Overdue', icon: MdWarning };
        }
        if (isGraded) {
            const grade = parseFloat(userSubmission.grade);
            const color = grade >= 90 ? 'bg-emerald-100 text-emerald-700' :
                grade >= 80 ? 'bg-blue-100 text-blue-700' :
                    grade >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
            return { color, text: `${Math.round(grade)}%`, icon: MdGrade };
        }
        if (hasSubmitted) {
            return { color: 'bg-emerald-100 text-emerald-700', text: 'Submitted', icon: MdCheckCircle };
        }
        return null;
    };


    const statusBadge = getStatusBadge();


    // Format due date
    const formatDueDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();


        if (isToday) return 'Today';
        if (isTomorrow) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };


    return (
        <div className={`bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg ${isRefreshing ? 'opacity-70' : ''}`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Task Icon */}
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MdAssignment className="text-purple-600 w-5 h-5" />
                        </div>


                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">{task.title}</h3>


                            <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                                <span>{task.type || 'Assignment'}</span>
                                <span>•</span>
                                <span className="font-medium text-purple-600">{task.points || 0} pts</span>
                                {task.dueDate && (
                                    <>
                                        <span>•</span>
                                        <span className={calculatedData.isOverdue ? 'text-red-600 font-medium' : ''}>
                                            Due {formatDueDate(task.dueDate)}
                                        </span>
                                    </>
                                )}
                            </div>


                            {/* Status Badge */}
                            <div className="flex items-center space-x-2">
                                {statusBadge && (
                                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                        <statusBadge.icon className="w-3 h-3 mr-1" />
                                        {statusBadge.text}
                                    </div>
                                )}


                                <div className="text-xs text-slate-500 flex items-center">
                                    <MdPerson className="w-3 h-3 mr-1" />
                                    {calculatedData.submissionCount} submission{calculatedData.submissionCount !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Actions - Only Delete Button */}
                    {isOwner && (
                        <div className="flex items-center ml-3">
                            <button
                                onClick={handleDeleteTask}
                                className="w-8 h-8 text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
                                disabled={isRefreshing}
                            >
                                <MdDelete className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>


                {/* Description */}
                {task.description && (
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{task.description}</p>
                )}
            </div>


            {/* Grade Display for Students */}
            {userRole === 'student' && calculatedData.isGraded && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${parseFloat(calculatedData.userSubmission.grade) >= 90 ? 'bg-emerald-500' :
                            parseFloat(calculatedData.userSubmission.grade) >= 80 ? 'bg-blue-500' :
                                parseFloat(calculatedData.userSubmission.grade) >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}>
                            {Math.round(parseFloat(calculatedData.userSubmission.grade))}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Grade: {calculatedData.userSubmission.grade}/100</p>
                            <p className="text-xs text-slate-600">
                                Graded by {calculatedData.userSubmission.gradedBy}
                            </p>
                        </div>
                    </div>
                    {calculatedData.userSubmission.feedback && (
                        <p className="text-sm text-slate-700 mt-2 italic">"{calculatedData.userSubmission.feedback}"</p>
                    )}
                </div>
            )}


            {/* Action Section */}
            <div className="p-4">
                {userRole === 'student' ? (
                    <div>
                        {calculatedData.hasSubmitted ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm">
                                    <MdCheckCircle className={`w-4 h-4 ${calculatedData.isGraded ? 'text-purple-600' : 'text-emerald-600'}`} />
                                    <span className={calculatedData.isGraded ? 'text-purple-700' : 'text-emerald-700'}>
                                        {calculatedData.isGraded ? 'Graded' : 'Submitted'}
                                    </span>
                                </div>


                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleViewSubmissions}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium transition-colors"
                                        disabled={isRefreshing}
                                    >
                                        View
                                    </button>
                                    {calculatedData.canResubmit && (
                                        <button
                                            onClick={() => setShowSubmitModal(true)}
                                            className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-md text-sm font-medium transition-colors"
                                            disabled={isRefreshing}
                                        >
                                            Resubmit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {calculatedData.canSubmit ? (
                                    <button
                                        onClick={() => setShowSubmitModal(true)}
                                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                        disabled={isRefreshing}
                                    >
                                        {isRefreshing ? (
                                            <>
                                                <MdRefresh className="animate-spin w-4 h-4 mr-2 inline" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <MdFileUpload className="w-4 h-4 mr-2 inline" />
                                                Submit Assignment
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center py-2 text-red-600 text-sm font-medium">
                                        <MdWarning className="w-4 h-4 mr-1 inline" />
                                        Submission Deadline Passed
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Teacher View
                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-600">
                            👨‍🏫 {calculatedData.submissionCount > 0
                                ? `${calculatedData.submissionCount} submission${calculatedData.submissionCount !== 1 ? 's' : ''}`
                                : 'No submissions yet'}
                        </div>
                        <button
                            onClick={handleViewSubmissions}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium transition-colors"
                            disabled={isRefreshing}
                        >
                            Manage
                        </button>
                    </div>
                )}
            </div>


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


            {/* Conditional modal rendering */}
            {showViewSubmissions && !onViewSubmissions && (
                <ViewSubmissionModal
                    taskId={task._id || task.id}
                    classroomId={classroomId}
                    task={task}
                    isOpen={showViewSubmissions}
                    onClose={() => setShowViewSubmissions(false)}
                    userRole={userRole}
                    userEmail={userEmail}
                />
            )}
        </div>
    );
};


export default TaskCard;
