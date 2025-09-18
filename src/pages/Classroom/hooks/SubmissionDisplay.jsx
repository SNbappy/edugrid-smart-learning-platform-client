import React from 'react';
import { MdDownload, MdVisibility, MdEdit, MdCheckCircle } from 'react-icons/md';

const SubmissionDisplay = ({
    task,
    userEmail,
    userRole,
    onViewSubmission,
    onViewAllSubmissions,
    onEditSubmission
}) => {
    const userSubmission = task.submissions?.find(sub => sub.studentEmail === userEmail);
    const hasSubmitted = !!userSubmission;
    const isTeacher = userRole === 'teacher';
    const submissionCount = task.submissions?.length || 0;

    console.log('🔍 SUBMISSION DISPLAY DEBUG:', {
        taskId: task._id || task.id,
        taskTitle: task.title,
        userEmail,
        userRole,
        hasSubmitted,
        userSubmission,
        totalSubmissions: submissionCount,
        allSubmissions: task.submissions
    });

    if (isTeacher) {
        // TEACHER VIEW
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Submissions</h3>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                    </span>
                </div>

                {submissionCount === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-3">📝</div>
                        <p className="text-gray-500">No submissions yet</p>
                        <p className="text-gray-400 text-sm">Students haven't submitted this task</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {task.submissions.map((submission, index) => (
                            <div key={submission.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <MdCheckCircle className="text-green-500 text-xl" />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {submission.studentName || submission.studentEmail}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                        </p>
                                        {submission.text && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                "{submission.text.substring(0, 100)}..."
                                            </p>
                                        )}
                                        {submission.fileUrl && (
                                            <p className="text-sm text-blue-600 mt-1">
                                                📎 File attached
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onViewSubmission(submission)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        <MdVisibility className="inline mr-1" />
                                        View
                                    </button>
                                    {submission.fileUrl && (
                                        <a
                                            href={submission.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                                        >
                                            <MdDownload className="inline mr-1" />
                                            Download
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => onViewAllSubmissions(task._id || task.id)}
                            className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            View All Submissions Details
                        </button>
                    </div>
                )}
            </div>
        );
    } else {
        // STUDENT VIEW
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Submission</h3>

                {hasSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                            <MdCheckCircle className="text-green-500 text-xl mr-2" />
                            <span className="text-green-800 font-medium">Submitted Successfully</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>Submitted:</strong> {new Date(userSubmission.submittedAt).toLocaleString()}
                            </p>

                            {userSubmission.text && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Text:</strong></p>
                                    <div className="bg-white p-3 rounded border text-sm">
                                        {userSubmission.text}
                                    </div>
                                </div>
                            )}

                            {userSubmission.fileUrl && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1"><strong>File:</strong></p>
                                    <a
                                        href={userSubmission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        <MdDownload className="mr-1" />
                                        Download Your File
                                    </a>
                                </div>
                            )}

                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => onViewSubmission(task._id || task.id)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                                >
                                    <MdVisibility className="inline mr-1" />
                                    View Details
                                </button>

                                {task.allowResubmission !== false && (
                                    <button
                                        onClick={() => onEditSubmission(task._id || task.id)}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                                    >
                                        <MdEdit className="inline mr-1" />
                                        Resubmit
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                            🔒 Private - Only visible to you and the instructor
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <div className="text-gray-400 text-4xl mb-3">📝</div>
                        <p className="text-gray-500 mb-2">You haven't submitted yet</p>
                        <p className="text-gray-400 text-sm">Complete your work and submit when ready</p>
                    </div>
                )}
            </div>
        );
    }
};

export default SubmissionDisplay;
