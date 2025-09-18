import React from 'react';
import { MdClose, MdDownload, MdVisibility } from 'react-icons/md';

const SubmissionViewModal = ({ submission, onClose, isOwner, userRole }) => {
    if (!submission) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Submission Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MdClose className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Student Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Student Information</h3>
                        <p className="text-blue-800">
                            <strong>Name:</strong> {submission.studentName || 'N/A'}
                        </p>
                        <p className="text-blue-800">
                            <strong>Email:</strong> {submission.studentEmail}
                        </p>
                        <p className="text-blue-800">
                            <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                        {submission.isResubmission && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-2">
                                Resubmission
                            </span>
                        )}
                    </div>

                    {/* Task Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Task: {submission.taskTitle}</h3>
                    </div>

                    {/* Submission Text */}
                    {submission.submission?.text && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Submission Text</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="whitespace-pre-wrap text-gray-800">
                                    {submission.submission.text}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* File Attachment */}
                    {submission.submission?.fileUrl && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">File Attachment</h3>
                            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-green-800 font-medium">File attached</p>
                                    <p className="text-green-600 text-sm">Click to view or download</p>
                                </div>
                                <div className="flex space-x-2">
                                    <a
                                        href={submission.submission.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        <MdVisibility className="mr-1" />
                                        View
                                    </a>
                                    <a
                                        href={submission.submission.fileUrl}
                                        download
                                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                                    >
                                        <MdDownload className="mr-1" />
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy Notice */}
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-yellow-800 text-sm">
                            🔒 <strong>Privacy:</strong> This submission is only visible to the student and instructor.
                        </p>
                    </div>

                    {/* Teacher View Notice */}
                    {isOwner && userRole === 'teacher' && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-purple-800 text-sm">
                                👨‍🏫 <strong>Teacher View:</strong> You are viewing this submission as an instructor.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionViewModal;
