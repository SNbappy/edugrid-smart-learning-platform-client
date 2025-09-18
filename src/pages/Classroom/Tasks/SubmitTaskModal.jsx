import React, { useState } from 'react';
import { MdClose, MdAttachFile } from 'react-icons/md';

const SubmitTaskModal = ({ task, onClose, onSubmit, isResubmission, existingSubmission }) => {
    const [submissionText, setSubmissionText] = useState(existingSubmission?.text || '');
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(existingSubmission?.fileUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!submissionText.trim() && !file && !fileUrl) {
            alert('Please provide either text or a file for your submission.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create properly structured submission data
            const submissionData = {
                text: submissionText.trim(),
                fileUrl: fileUrl || null,
                submissionType: file ? 'file' : 'text'
            };

            console.log('📝 MODAL SUBMISSION DATA:', {
                submissionData,
                isResubmission,
                taskId: task._id || task.id,
                taskTitle: task.title
            });

            const result = await onSubmit(submissionData, isResubmission);

            if (result?.success) {
                onClose();
            }
        } catch (error) {
            console.error('Error in modal submission:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // You might want to upload the file here and get a URL
            // For now, we'll just use the file name
            setFileUrl(`uploaded/${selectedFile.name}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isResubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        <MdClose className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Task Info */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-900 mb-2">Task: {task.title}</h3>
                            {task.description && (
                                <p className="text-blue-800 text-sm">{task.description}</p>
                            )}
                        </div>

                        {/* Text Submission */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Submission Text
                            </label>
                            <textarea
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Enter your submission here..."
                                rows={6}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach File (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full"
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.png,.gif"
                                    disabled={isSubmitting}
                                />
                                {file && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Selected: {file.name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Existing Submission Info */}
                        {isResubmission && existingSubmission && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h4 className="font-medium text-orange-800 mb-2">Previous Submission:</h4>
                                <p className="text-orange-700 text-sm">
                                    Submitted: {new Date(existingSubmission.submittedAt).toLocaleString()}
                                </p>
                                {existingSubmission.text && (
                                    <div className="mt-2 text-sm text-orange-700">
                                        Previous text: "{existingSubmission.text.substring(0, 100)}..."
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {isResubmission ? 'Resubmitting...' : 'Submitting...'}
                                </div>
                            ) : (
                                isResubmission ? 'Resubmit Assignment' : 'Submit Assignment'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitTaskModal;
