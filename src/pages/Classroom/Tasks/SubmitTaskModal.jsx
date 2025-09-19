import React, { useState } from 'react';
import { MdClose, MdAttachFile } from 'react-icons/md';

const SubmitTaskModal = ({ task, onClose, onSubmit, isResubmission, existingSubmission }) => {
    const [submissionText, setSubmissionText] = useState(existingSubmission?.text || '');
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(existingSubmission?.fileUrl || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Cloudinary configuration
    const cloudName = 'dminscmik';
    const uploadPreset = 'submissions';
    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('cloud_name', cloudName);

        try {
            setUploadProgress(0);

            const response = await fetch(cloudinaryUploadUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Upload failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();

            // Verify upload success
            if (result.secure_url && result.public_id) {
                console.log('✅ File uploaded successfully to Cloudinary:', {
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    bytes: result.bytes,
                    resourceType: result.resource_type,
                    created_at: result.created_at,
                    originalFilename: result.original_filename
                });

                // Verify file accessibility
                await verifyFileAccess(result.secure_url);

                return result;
            } else {
                throw new Error('Invalid response from Cloudinary - missing secure_url or public_id');
            }
        } catch (error) {
            console.error('❌ Cloudinary upload failed:', error);
            throw error;
        }
    };

    // Verify that the uploaded file is accessible
    const verifyFileAccess = async (fileUrl) => {
        try {
            const response = await fetch(fileUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log('✅ File is accessible and verified at:', fileUrl);
                return true;
            } else {
                console.warn('⚠️ File upload successful but accessibility check failed:', response.status);
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Error verifying file accessibility:', error);
            return false;
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file size (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (selectedFile.size > maxSize) {
                alert('File size must be less than 10MB');
                return;
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                alert('Please select a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG, GIF)');
                return;
            }

            setFile(selectedFile);
            setIsUploading(true);
            setUploadProgress(0);

            try {
                console.log('📤 Starting upload for file:', {
                    name: selectedFile.name,
                    size: selectedFile.size,
                    type: selectedFile.type
                });

                const uploadResult = await uploadToCloudinary(selectedFile);
                setFileUrl(uploadResult.secure_url);

                // Show success message with file details
                alert(`✅ File uploaded successfully!\nFile: ${uploadResult.original_filename}\nSize: ${(uploadResult.bytes / 1024).toFixed(2)} KB\nURL: ${uploadResult.secure_url}`);

            } catch (error) {
                console.error('Upload error:', error);
                alert(`❌ Failed to upload file: ${error.message}`);
                setFile(null);
                setFileUrl('');
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setFileUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!submissionText.trim() && !file && !fileUrl) {
            alert('Please provide either text or a file for your submission.');
            return;
        }

        if (isUploading) {
            alert('Please wait for the file upload to complete before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create properly structured submission data
            const submissionData = {
                text: submissionText.trim(),
                fileUrl: fileUrl || null,
                submissionType: fileUrl ? 'file' : 'text',
                fileName: file?.name || null
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
                        disabled={isSubmitting || isUploading}
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
                            {task.dueDate && (
                                <p className="text-blue-700 text-sm mt-1">
                                    Due: {new Date(task.dueDate).toLocaleString()}
                                </p>
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
                                Attach File (Optional) - Max 10MB
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                                {!file && (
                                    <>
                                        <div className="flex items-center justify-center mb-2">
                                            <MdAttachFile className="text-2xl text-gray-400" />
                                        </div>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                            disabled={isSubmitting || isUploading}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                                        </p>
                                    </>
                                )}

                                {isUploading && (
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        </div>
                                        <p className="text-sm text-blue-600">
                                            Uploading to Cloudinary...
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            File: {file?.name}
                                        </p>
                                    </div>
                                )}

                                {file && !isUploading && fileUrl && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-green-800">
                                                    ✅ {file.name}
                                                </p>
                                                <p className="text-xs text-green-600">
                                                    Size: {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    View uploaded file →
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-red-500 hover:text-red-700 text-sm ml-2"
                                                disabled={isSubmitting}
                                            >
                                                Remove
                                            </button>
                                        </div>
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
                                {existingSubmission.fileUrl && (
                                    <div className="mt-2 text-sm">
                                        <a
                                            href={existingSubmission.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-600 hover:underline"
                                        >
                                            View previous file →
                                        </a>
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
                            disabled={isSubmitting || isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || isUploading || (!submissionText.trim() && !fileUrl)}
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
