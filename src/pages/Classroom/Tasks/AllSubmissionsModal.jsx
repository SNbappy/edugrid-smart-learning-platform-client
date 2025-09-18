import React, { useState } from 'react';
import { MdClose, MdDownload, MdVisibility, MdPeople, MdCheckCircle } from 'react-icons/md';

const AllSubmissionsModal = ({ allSubmissions, onClose, classroomName, userRole }) => {
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!allSubmissions) return null;

    const { taskId, taskTitle, submissions } = allSubmissions;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">All Submissions</h2>
                        <p className="text-gray-600 mt-1">
                            <span className="font-medium">{taskTitle}</span> - {classroomName}
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-blue-600">
                            <MdPeople className="mr-2" />
                            <span className="font-medium">{submissions.length} Submission{submissions.length !== 1 ? 's' : ''}</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MdClose className="text-xl text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl text-gray-300 mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Submissions Yet</h3>
                            <p className="text-gray-500">Students haven't submitted this task yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {submissions.map((submission, index) => (
                                <div
                                    key={submission.id || index}
                                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <MdCheckCircle className="text-green-500 text-xl" />
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {submission.studentName || submission.studentEmail}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                                    </p>
                                                    {submission.isResubmission && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                                            Resubmission
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Submission Preview */}
                                            <div className="space-y-3">
                                                {submission.text && (
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Text Submission:</h4>
                                                        <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700">
                                                            {submission.text.length > 150
                                                                ? `${submission.text.substring(0, 150)}...`
                                                                : submission.text
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {submission.fileUrl && (
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <div className="flex items-center text-blue-600">
                                                            📎 <span className="ml-1">File attached</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => setSelectedSubmission({
                                                    ...submission,
                                                    taskTitle,
                                                    submission: { text: submission.text, fileUrl: submission.fileUrl }
                                                })}
                                                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                                            >
                                                <MdVisibility className="mr-1" />
                                                View Details
                                            </button>

                                            {submission.fileUrl && (
                                                <a
                                                    href={submission.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                                                >
                                                    <MdDownload className="mr-1" />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Teacher Notice */}
                    {userRole === 'teacher' && submissions.length > 0 && (
                        <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-purple-800 text-sm">
                                👨‍🏫 <strong>Teacher View:</strong> You can view all student submissions for this task.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Total: {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Detailed Submission View Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Detailed View</h2>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <MdClose className="text-xl text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <strong>Student:</strong> {selectedSubmission.studentName || selectedSubmission.studentEmail}
                                </div>
                                <div>
                                    <strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                                </div>
                                {selectedSubmission.submission?.text && (
                                    <div>
                                        <strong>Full Text:</strong>
                                        <div className="mt-2 p-4 bg-gray-50 rounded border whitespace-pre-wrap">
                                            {selectedSubmission.submission.text}
                                        </div>
                                    </div>
                                )}
                                {selectedSubmission.submission?.fileUrl && (
                                    <div>
                                        <strong>File:</strong>
                                        <div className="mt-2">
                                            <a
                                                href={selectedSubmission.submission.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 underline"
                                            >
                                                View/Download File
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllSubmissionsModal;
