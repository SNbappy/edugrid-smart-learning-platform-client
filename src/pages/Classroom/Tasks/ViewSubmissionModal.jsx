import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MdClose,
    MdDownload,
    MdVisibility,
    MdPictureAsPdf,
    MdImage,
    MdDescription,
    MdAttachFile,
    MdPerson,
    MdSchedule,
    MdGrade,
    MdWarning,
    MdVideoLibrary,
    MdAudiotrack,
    MdRefresh,
    MdCheckCircle
} from 'react-icons/md';

// Simple API Configuration
const getBaseURL = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    if (process.env.NODE_ENV === 'development') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'https://edugrid-smart-learning-platform-ser.vercel.app';
        }
        return `http://${hostname}:5000`;
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}`;
};

const buildURL = (endpoint) => {
    const baseURL = getBaseURL();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
    return `${baseURL}/${apiEndpoint}`;
};

const ViewSubmissionModal = ({
    taskId,
    classroomId,
    task,
    isOpen,
    onClose,
    userRole,
    userEmail,
    onGradeSubmitted,
    onTaskUpdate
}) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [grading, setGrading] = useState({ grade: '', feedback: '' });
    const [imageErrors, setImageErrors] = useState({});
    const [gradingInProgress, setGradingInProgress] = useState(false);

    // Create axios instance with auth
    const createAxiosInstance = () => {
        const instance = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            if (userEmail) {
                config.headers['user-email'] = userEmail;
            }

            return config;
        });

        return instance;
    };

    useEffect(() => {
        if (isOpen && taskId && classroomId && userEmail) {
            fetchSubmissions();
        } else if (isOpen && (!taskId || !classroomId || !userEmail)) {
            setError('Missing required data: ' +
                (!taskId ? 'taskId ' : '') +
                (!classroomId ? 'classroomId ' : '') +
                (!userEmail ? 'userEmail' : '')
            );
            setLoading(false);
        }
    }, [isOpen, taskId, classroomId, userEmail]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = buildURL(`classrooms/${classroomId}/tasks/${taskId}/submissions`);
            const axiosInstance = createAxiosInstance();
            const response = await axiosInstance.get(apiUrl);

            if (response.data.success) {
                const allSubmissions = response.data.submissions || [];
                setSubmissions(allSubmissions);

                // For students, auto-select their submission
                if (userRole === 'student') {
                    const userSubmission = allSubmissions.find(sub =>
                        sub.studentEmail === userEmail
                    );

                    if (userSubmission) {
                        setSelectedSubmission(userSubmission);
                    }
                }
            } else {
                setError(response.data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            let errorMessage = 'Failed to load submissions';

            if (error.response?.status === 404) {
                errorMessage = 'Task or submissions not found';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied - insufficient permissions';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication required - please log in';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Enhanced grade submission with callback
    const handleGradeSubmission = async (submissionId) => {
        try {
            setGradingInProgress(true);

            const apiUrl = buildURL(`classrooms/${classroomId}/tasks/${taskId}/submissions/${submissionId}/grade`);
            const axiosInstance = createAxiosInstance();

            const response = await axiosInstance.put(apiUrl, {
                grade: grading.grade,
                feedback: grading.feedback
            });

            if (response.data.success) {
                // Find the graded submission details
                const gradedSubmission = submissions.find(s =>
                    s.id?.toString() === submissionId || s._id?.toString() === submissionId
                );

                const gradeUpdateData = {
                    taskId,
                    submissionId,
                    studentEmail: gradedSubmission?.studentEmail,
                    studentName: gradedSubmission?.studentName,
                    grade: parseFloat(grading.grade),
                    feedback: grading.feedback,
                    gradedBy: userEmail,
                    gradedAt: new Date().toISOString(),
                    classroomId
                };

                // Refresh submissions in this modal
                await fetchSubmissions();

                // Notify parent component about grade update
                if (onGradeSubmitted) {
                    try {
                        await onGradeSubmitted(gradeUpdateData);
                    } catch (callbackError) {
                        console.error('Grade callback error:', callbackError);
                    }
                }

                // Trigger task data refresh in parent
                if (onTaskUpdate) {
                    try {
                        await onTaskUpdate(taskId, classroomId);
                    } catch (callbackError) {
                        console.error('Task update callback error:', callbackError);
                    }
                }

                // Reset grading form
                setGrading({ grade: '', feedback: '' });
                setError(null);

            } else {
                setError(response.data.message || 'Failed to grade submission');
            }
        } catch (error) {
            let errorMessage = 'Failed to grade submission';

            if (error.response?.status === 404) {
                errorMessage = 'Grading endpoint not found. Please check backend routes.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Only instructors can grade submissions.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setGradingInProgress(false);
        }
    };

    const handleImageError = (attachmentIndex) => {
        setImageErrors(prev => ({
            ...prev,
            [attachmentIndex]: true
        }));
    };

    const handleDownload = async (fileUrl, fileName) => {
        try {
            let downloadUrl = fileUrl;
            if (fileUrl.includes('cloudinary.com')) {
                downloadUrl = fileUrl.includes('?')
                    ? `${fileUrl}&fl_attachment=true`
                    : `${fileUrl}?fl_attachment=true`;
            }

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            window.open(fileUrl, '_blank');
        }
    };

    const renderFilePreview = (attachment, index) => {
        if (!attachment || !attachment.url) {
            return null;
        }

        const fileExtension = attachment.name?.toLowerCase().split('.').pop() || attachment.type?.split('/')[1] || '';
        const mimeType = attachment.type || attachment.mimeType || '';

        const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
        const isPdf = mimeType === 'application/pdf' || fileExtension === 'pdf';
        const isVideo = mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension);
        const isAudio = mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(fileExtension);
        const isDoc = ['doc', 'docx', 'txt', 'rtf'].includes(fileExtension);

        return (
            <div key={`${attachment.url}-${index}`} className="border border-slate-200 rounded-lg p-4 bg-slate-50 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        {isImage && <MdImage className="text-emerald-500 text-xl" />}
                        {isPdf && <MdPictureAsPdf className="text-red-500 text-xl" />}
                        {isVideo && <MdVideoLibrary className="text-purple-500 text-xl" />}
                        {isAudio && <MdAudiotrack className="text-blue-500 text-xl" />}
                        {isDoc && <MdDescription className="text-blue-500 text-xl" />}
                        {!isImage && !isPdf && !isVideo && !isAudio && !isDoc && <MdAttachFile className="text-slate-500 text-xl" />}

                        <div>
                            <p className="font-medium text-slate-900">
                                {attachment.name || attachment.originalName || 'Uploaded File'}
                            </p>
                            <p className="text-sm text-slate-500">
                                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                            title="View file"
                        >
                            <MdVisibility className="mr-1 w-4 h-4" />
                            View
                        </button>

                        <button
                            onClick={() => handleDownload(attachment.url, attachment.name || attachment.originalName)}
                            className="flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors"
                            title="Download file"
                        >
                            <MdDownload className="mr-1 w-4 h-4" />
                            Download
                        </button>
                    </div>
                </div>

                {/* File Preview */}
                {isImage && !imageErrors[index] && (
                    <div className="mt-3">
                        <img
                            src={attachment.url}
                            alt={attachment.name || 'Image'}
                            className="max-w-full max-h-64 object-contain rounded-lg border border-slate-200"
                            onError={() => handleImageError(index)}
                        />
                    </div>
                )}

                {isImage && imageErrors[index] && (
                    <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-600 text-sm">Failed to load image preview</p>
                    </div>
                )}

                {isPdf && (
                    <div className="mt-3">
                        <iframe
                            src={`${attachment.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-64 border border-slate-200 rounded-lg"
                            title={attachment.name || 'PDF'}
                        />
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            PDF preview - <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Open in new tab for full view
                            </a>
                        </p>
                    </div>
                )}

                {isVideo && (
                    <div className="mt-3">
                        <video
                            src={attachment.url}
                            className="w-full h-64 object-contain rounded-lg border border-slate-200 bg-black"
                            controls
                            preload="metadata"
                        />
                    </div>
                )}

                {isAudio && (
                    <div className="mt-3">
                        <audio
                            src={attachment.url}
                            controls
                            className="w-full"
                            preload="metadata"
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderSubmissionDetails = (submission, index) => {
        return (
            <div key={submission.id || submission._id || submission.studentEmail || index} className="space-y-6">
                {/* Submission Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MdPerson className="text-blue-600 w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900">
                                    {submission.studentName || submission.submittedBy || submission.studentEmail}
                                </h4>
                                <p className="text-blue-700 text-sm">{submission.studentEmail}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center text-blue-700 text-sm">
                                <MdSchedule className="mr-1 w-4 h-4" />
                                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'No date'}
                            </div>
                            {submission.version > 1 && (
                                <div className="text-amber-600 text-sm font-medium mt-1">
                                    Resubmitted (v{submission.version})
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submission Text */}
                {submission.submissionText && (
                    <div className="border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3">Submission Text:</h5>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-slate-700 whitespace-pre-wrap">
                                {submission.submissionText}
                            </p>
                        </div>
                    </div>
                )}

                {/* Submission URL */}
                {submission.submissionUrl && (
                    <div className="border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3">Submission URL:</h5>
                        <a
                            href={submission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all block bg-blue-50 p-3 rounded-lg"
                        >
                            {submission.submissionUrl}
                        </a>
                    </div>
                )}

                {/* File Attachments */}
                {submission.attachments && submission.attachments.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-4">
                            Attached Files ({submission.attachments.length}):
                        </h5>
                        <div className="space-y-4">
                            {submission.attachments.map((attachment, attachIndex) =>
                                renderFilePreview(attachment, attachIndex)
                            )}
                        </div>
                    </div>
                ) : submission.files && submission.files.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-4">
                            Attached Files ({submission.files.length}):
                        </h5>
                        <div className="space-y-4">
                            {submission.files.map((file, fileIndex) =>
                                renderFilePreview(file, fileIndex)
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="border border-amber-200 rounded-lg p-4 text-center text-amber-700 bg-amber-50">
                        <MdWarning className="mx-auto text-2xl mb-2" />
                        <p className="font-medium">No files submitted</p>
                    </div>
                )}

                {/* Grading Section */}
                {userRole === 'teacher' && (
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                        <h5 className="font-medium text-purple-900 mb-4 flex items-center">
                            <MdGrade className="mr-2 w-5 h-5" />
                            Grading
                        </h5>

                        {submission.grade !== null && submission.grade !== undefined ? (
                            <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {Math.round(submission.grade)}
                                    </div>
                                    <div>
                                        <p className="text-emerald-800 font-semibold text-lg">
                                            Grade: {submission.grade}/100
                                        </p>
                                        <p className="text-emerald-600 text-sm">
                                            Graded by {submission.gradedBy} on {submission.gradedAt ? new Date(submission.gradedAt).toLocaleDateString() : 'Unknown date'}
                                        </p>
                                    </div>
                                </div>
                                {submission.feedback && (
                                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="text-emerald-800 text-sm">
                                            <strong>Feedback:</strong> {submission.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Grade (0-100) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Enter grade (0-100)"
                                        value={grading.grade}
                                        onChange={(e) => setGrading({ ...grading, grade: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                                        min="0"
                                        max="100"
                                        disabled={gradingInProgress}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Feedback (optional)
                                    </label>
                                    <textarea
                                        placeholder="Enter feedback for the student..."
                                        value={grading.feedback}
                                        onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                                        rows={3}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
                                        disabled={gradingInProgress}
                                    />
                                </div>
                                <button
                                    onClick={() => handleGradeSubmission(submission.id || submission._id)}
                                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                                    disabled={!grading.grade || gradingInProgress}
                                >
                                    {gradingInProgress ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting Grade...
                                        </>
                                    ) : (
                                        <>
                                            <MdGrade className="mr-2 w-4 h-4" />
                                            Submit Grade
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Background */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-5xl mx-auto h-[90vh] flex flex-col transform transition-all duration-300 scale-100 animate-in zoom-in-95">

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MdGrade className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {userRole === 'teacher' ?
                                    `All Submissions` :
                                    'Your Submission'
                                }
                            </h2>
                            <p className="text-sm text-slate-600">
                                {task?.title || task || 'Task'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center text-slate-400 hover:text-slate-600"
                    >
                        <MdClose className="w-6 h-6" />
                    </button>
                </div>

                {/* Grade Processing Notification */}
                {gradingInProgress && (
                    <div className="flex-shrink-0 bg-blue-100 border-b border-blue-200 p-4">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-blue-700 font-medium">Processing grade submission...</span>
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                <p className="text-slate-600 font-medium">Loading submissions...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-xl p-6">
                                <MdWarning className="mx-auto text-3xl mb-4 text-red-500" />
                                <h3 className="font-semibold mb-2 text-lg">Error Loading Submissions</h3>
                                <p className="mb-4">{error}</p>
                                <button
                                    onClick={fetchSubmissions}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    <MdRefresh className="mr-2 w-4 h-4" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-6">
                            <div className="text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-8">
                                <MdWarning className="mx-auto text-4xl mb-4 text-slate-400" />
                                <h3 className="font-semibold mb-2 text-lg">No Submissions Found</h3>
                                <p>No submissions have been made for this task yet.</p>
                                {userRole === 'student' && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        If you've submitted work, please check that you're logged in with the correct account.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {userRole === 'teacher' ? (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <p className="text-purple-800 font-medium flex items-center">
                                            <MdPerson className="mr-2 w-5 h-5" />
                                            Teacher View - Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {submissions.map((submission, index) => (
                                        <div key={submission.id || submission._id || submission.studentEmail || index} className="border-b border-slate-200 pb-6 last:border-b-0">
                                            {renderSubmissionDetails(submission, index)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                selectedSubmission ? (
                                    <div>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                                            <p className="text-emerald-800 font-medium flex items-center">
                                                <MdCheckCircle className="mr-2 w-5 h-5" />
                                                Your Submission Found
                                            </p>
                                        </div>
                                        {renderSubmissionDetails(selectedSubmission, 0)}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
                                            <MdWarning className="mx-auto text-4xl mb-4 text-amber-500" />
                                            <h3 className="font-semibold mb-2 text-lg">No Submission Found</h3>
                                            <p>We couldn't find your submission for this task.</p>
                                            <p className="text-sm mt-2 text-slate-600">
                                                Logged in as: {userEmail}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex justify-end p-6 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                        disabled={gradingInProgress}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionModal;