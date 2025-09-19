// ViewSubmissionModal.jsx - Updated to work without axiosPublic
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
    MdRefresh
} from 'react-icons/md';

// Dynamic API Configuration (built-in)
class APIConfig {
    constructor() {
        this.baseURL = this.getBaseURL();
    }

    getBaseURL() {
        if (import.meta.env.VITE_API_BASE_URL) {
            return import.meta.env.VITE_API_BASE_URL;
        }

        if (window._ENV_?.VITE_API_BASE_URL) {
            return window._ENV_.VITE_API_BASE_URL;
        }

        if (process.env.NODE_ENV === 'development') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return 'http://localhost:5000';
            }
            return `http://${hostname}:5000`;
        }

        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}`;
    }

    buildURL(endpoint) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;
        return `${this.baseURL}/${apiEndpoint}`;
    }

    getDebugInfo() {
        return {
            baseURL: this.baseURL,
            environment: process.env.NODE_ENV,
            buildEnv: import.meta.env.VITE_API_BASE_URL,
            runtimeEnv: window._ENV_?.VITE_API_BASE_URL,
            hostname: window.location.hostname
        };
    }
}

const apiConfig = new APIConfig();

const ViewSubmissionModal = ({
    taskId,
    classroomId,
    task,
    isOpen,
    onClose,
    userRole,
    userEmail
}) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [grading, setGrading] = useState({ grade: '', feedback: '' });
    const [debugInfo, setDebugInfo] = useState({});
    const [imageErrors, setImageErrors] = useState({});

    // Create axios instance with auth
    const createAxiosInstance = () => {
        const instance = axios.create({
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Add auth headers
        instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                if (userEmail) {
                    config.headers['user-email'] = userEmail;
                }

                console.log('📤 API REQUEST:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    headers: {
                        authorization: config.headers.Authorization ? 'present' : 'missing',
                        userEmail: config.headers['user-email']
                    }
                });

                return config;
            },
            (error) => {
                console.error('❌ REQUEST ERROR:', error);
                return Promise.reject(error);
            }
        );

        instance.interceptors.response.use(
            (response) => {
                console.log('📥 API RESPONSE:', {
                    status: response.status,
                    url: response.config.url,
                    success: response.data?.success,
                    dataType: typeof response.data,
                    isHTML: typeof response.data === 'string' && response.data.includes('<!doctype html>')
                });

                // Check if we received HTML instead of JSON
                if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                    console.error('❌ RECEIVED HTML INSTEAD OF JSON');
                    throw new Error('API returned HTML instead of JSON. Backend server may not be running or route may not exist.');
                }

                return response;
            },
            (error) => {
                console.error('❌ API RESPONSE ERROR:', {
                    message: error.message,
                    status: error.response?.status,
                    url: error.config?.url,
                    responseData: error.response?.data
                });
                return Promise.reject(error);
            }
        );

        return instance;
    };

    // Debug component props on mount
    useEffect(() => {
        console.log('🚀 ViewSubmissionModal MOUNTED with props:', {
            taskId,
            classroomId,
            task: task?.title || task,
            isOpen,
            userRole,
            userEmail,
            apiConfig: apiConfig.getDebugInfo()
        });
    }, []);

    useEffect(() => {
        if (isOpen && taskId && classroomId && userEmail) {
            console.log('✅ MODAL CONDITIONS MET - FETCHING SUBMISSIONS');
            fetchSubmissions();
        } else {
            console.log('❌ MODAL CONDITIONS NOT MET:', {
                isOpen,
                taskId: !!taskId,
                classroomId: !!classroomId,
                userEmail: !!userEmail
            });

            if (isOpen && (!taskId || !classroomId || !userEmail)) {
                setError('Missing required data: ' +
                    (!taskId ? 'taskId ' : '') +
                    (!classroomId ? 'classroomId ' : '') +
                    (!userEmail ? 'userEmail' : '')
                );
                setLoading(false);
            }
        }
    }, [isOpen, taskId, classroomId, userEmail]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🎯 FETCHING SUBMISSIONS WITH BUILT-IN API:', {
                classroomId,
                taskId,
                userEmail,
                userRole,
                timestamp: new Date().toISOString(),
                apiConfig: apiConfig.getDebugInfo()
            });

            // Build URL using the dynamic config
            const apiUrl = apiConfig.buildURL(`classrooms/${classroomId}/tasks/${taskId}/submissions`);
            console.log('🌐 FULL API URL:', apiUrl);

            // Create axios instance with auth
            const axiosInstance = createAxiosInstance();

            // Make the API call
            const response = await axiosInstance.get(apiUrl);

            console.log('📥 SUBMISSIONS RESPONSE:', {
                success: response.data.success,
                count: response.data.count,
                submissionsLength: response.data.submissions?.length || 0,
                userRole: response.data.userRole,
                debug: response.data.debug
            });

            if (response.data.success) {
                const allSubmissions = response.data.submissions || [];

                setDebugInfo({
                    apiResponse: response.data,
                    totalSubmissions: allSubmissions.length,
                    userRole: userRole,
                    responseUserRole: response.data.userRole,
                    timestamp: new Date().toISOString(),
                    apiUrl: apiUrl
                });

                setSubmissions(allSubmissions);

                // For students, auto-select their submission
                if (userRole === 'student') {
                    console.log('👤 STUDENT MODE - LOOKING FOR USER SUBMISSION');

                    const userSubmission = allSubmissions.find(sub => {
                        const emailMatch = sub.studentEmail === userEmail;
                        console.log('🔍 EMAIL COMPARISON:', {
                            submissionEmail: sub.studentEmail,
                            userEmail: userEmail,
                            match: emailMatch
                        });
                        return emailMatch;
                    });

                    console.log('✅ USER SUBMISSION RESULT:', {
                        found: !!userSubmission,
                        submission: userSubmission
                    });

                    if (userSubmission) {
                        setSelectedSubmission(userSubmission);
                    }
                } else {
                    console.log('👨‍🏫 TEACHER MODE - SHOWING ALL SUBMISSIONS');
                }
            } else {
                console.log('❌ API RESPONSE NOT SUCCESS:', response.data.message);
                setError(response.data.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            console.error('❌ FETCH ERROR DETAILS:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });

            let errorMessage = 'Failed to load submissions';

            if (error.message && error.message.includes('HTML instead of JSON')) {
                errorMessage = 'API server not responding correctly. Please check if the backend is running on ' + apiConfig.baseURL;
            } else if (error.response?.status === 404) {
                errorMessage = 'Task or submissions not found';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied - insufficient permissions';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication required - please log in';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                errorMessage = `Cannot connect to API server at ${apiConfig.baseURL}. Please ensure the backend server is running.`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmission = async (submissionId) => {
        try {
            console.log('📝 GRADING SUBMISSION:', { submissionId, grade: grading.grade, feedback: grading.feedback });

            const apiUrl = apiConfig.buildURL(`classrooms/${classroomId}/tasks/${taskId}/submissions/${submissionId}/grade`);
            const axiosInstance = createAxiosInstance();

            const response = await axiosInstance.put(apiUrl, {
                grade: grading.grade,
                feedback: grading.feedback
            });

            if (response.data.success) {
                console.log('✅ GRADING SUCCESSFUL');
                await fetchSubmissions();
                setGrading({ grade: '', feedback: '' });
            } else {
                console.error('❌ GRADING FAILED:', response.data.message);
                setError(response.data.message || 'Failed to grade submission');
            }
        } catch (error) {
            console.error('❌ GRADING ERROR:', error);
            setError('Failed to grade submission: ' + error.message);
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
            console.log('⬇️ DOWNLOADING FILE:', { fileUrl, fileName });

            // For Cloudinary URLs, add download flag
            let downloadUrl = fileUrl;
            if (fileUrl.includes('cloudinary.com')) {
                downloadUrl = fileUrl.includes('?')
                    ? `${fileUrl}&fl_attachment=true`
                    : `${fileUrl}?fl_attachment=true`;
            }

            // Create download link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('❌ DOWNLOAD ERROR:', error);
            // Fallback - open in new tab
            window.open(fileUrl, '_blank');
        }
    };

    const renderFilePreview = (attachment, index) => {
        if (!attachment || !attachment.url) {
            console.log('❌ INVALID ATTACHMENT:', attachment);
            return null;
        }

        console.log('📎 RENDERING ATTACHMENT:', attachment);

        const fileExtension = attachment.name?.toLowerCase().split('.').pop() || attachment.type?.split('/')[1] || '';
        const mimeType = attachment.type || attachment.mimeType || '';

        const isImage = mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
        const isPdf = mimeType === 'application/pdf' || fileExtension === 'pdf';
        const isVideo = mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(fileExtension);
        const isAudio = mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(fileExtension);
        const isDoc = ['doc', 'docx', 'txt', 'rtf'].includes(fileExtension);

        return (
            <div key={`${attachment.url}-${index}`} className="border rounded-lg p-4 bg-gray-50 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {isImage && <MdImage className="text-green-500 text-xl" />}
                        {isPdf && <MdPictureAsPdf className="text-red-500 text-xl" />}
                        {isVideo && <MdVideoLibrary className="text-purple-500 text-xl" />}
                        {isAudio && <MdAudiotrack className="text-blue-500 text-xl" />}
                        {isDoc && <MdDescription className="text-blue-500 text-xl" />}
                        {!isImage && !isPdf && !isVideo && !isAudio && !isDoc && <MdAttachFile className="text-gray-500 text-xl" />}

                        <div>
                            <p className="font-medium text-gray-900">
                                {attachment.name || attachment.originalName || 'Uploaded File'}
                            </p>
                            <p className="text-sm text-gray-500">
                                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                            </p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => window.open(attachment.url, '_blank')}
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors"
                            title="View file"
                        >
                            <MdVisibility className="mr-1" />
                            View
                        </button>

                        <button
                            onClick={() => handleDownload(attachment.url, attachment.name || attachment.originalName)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm transition-colors"
                            title="Download file"
                        >
                            <MdDownload className="mr-1" />
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
                            className="max-w-full max-h-64 object-contain rounded border"
                            onLoad={() => console.log('✅ IMAGE LOADED:', attachment.url)}
                            onError={(e) => {
                                console.log('❌ IMAGE LOAD ERROR:', attachment.url);
                                handleImageError(index);
                            }}
                        />
                    </div>
                )}

                {isImage && imageErrors[index] && (
                    <div className="mt-3 p-4 bg-red-50 rounded border border-red-200">
                        <p className="text-red-500 text-sm">Failed to load image preview</p>
                    </div>
                )}

                {isPdf && (
                    <div className="mt-3">
                        <iframe
                            src={`${attachment.url}#toolbar=0&navpanes=0&scrollbar=0`}
                            className="w-full h-64 border rounded"
                            title={attachment.name || 'PDF'}
                            onLoad={() => console.log('✅ PDF LOADED:', attachment.url)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
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
                            className="w-full h-64 object-contain rounded border bg-black"
                            controls
                            preload="metadata"
                            onLoadedData={() => console.log('✅ VIDEO LOADED:', attachment.url)}
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
        console.log('🎨 RENDERING SUBMISSION:', submission);

        return (
            <div key={submission.id || submission._id || submission.studentEmail || index} className="space-y-6">
                {/* Submission Header */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MdPerson className="text-blue-600 text-xl" />
                            <div>
                                <h4 className="font-semibold text-blue-900">
                                    {submission.studentName || submission.submittedBy || submission.studentEmail}
                                </h4>
                                <p className="text-blue-700 text-sm">{submission.studentEmail}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center text-blue-700 text-sm">
                                <MdSchedule className="mr-1" />
                                {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'No date'}
                            </div>
                            {submission.version > 1 && (
                                <div className="text-orange-600 text-sm">
                                    Resubmitted (v{submission.version})
                                </div>
                            )}
                            {submission.status && (
                                <div className="text-gray-600 text-sm">
                                    Status: {submission.status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submission Text */}
                {submission.submissionText && (
                    <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Submission Text:</h5>
                        <div className="bg-gray-50 rounded p-3">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {submission.submissionText}
                            </p>
                        </div>
                    </div>
                )}

                {/* Submission URL */}
                {submission.submissionUrl && (
                    <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Submission URL:</h5>
                        <a
                            href={submission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                        >
                            {submission.submissionUrl}
                        </a>
                    </div>
                )}

                {/* File Attachments - KEY SECTION FOR DISPLAYING FILES */}
                {submission.attachments && submission.attachments.length > 0 ? (
                    <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-4">
                            Attached Files ({submission.attachments.length}):
                        </h5>
                        <div className="space-y-4">
                            {submission.attachments.map((attachment, attachIndex) =>
                                renderFilePreview(attachment, attachIndex)
                            )}
                        </div>
                    </div>
                ) : submission.files && submission.files.length > 0 ? (
                    <div className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-4">
                            Attached Files ({submission.files.length}):
                        </h5>
                        <div className="space-y-4">
                            {submission.files.map((file, fileIndex) =>
                                renderFilePreview(file, fileIndex)
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="border rounded-lg p-4 text-center text-gray-500 bg-yellow-50">
                        <MdWarning className="mx-auto text-2xl mb-2 text-yellow-600" />
                        No files submitted
                    </div>
                )}

                {/* Grading Section */}
                {userRole === 'teacher' && (
                    <div className="border rounded-lg p-4 bg-purple-50">
                        <h5 className="font-medium text-purple-900 mb-4 flex items-center">
                            <MdGrade className="mr-2" />
                            Grading
                        </h5>

                        {submission.grade !== null && submission.grade !== undefined ? (
                            <div className="bg-green-100 border border-green-200 rounded p-3">
                                <p className="text-green-800 font-medium">
                                    Grade: {submission.grade}
                                </p>
                                {submission.feedback && (
                                    <p className="text-green-700 mt-1">
                                        Feedback: {submission.feedback}
                                    </p>
                                )}
                                <p className="text-green-600 text-sm mt-1">
                                    Graded by {submission.gradedBy} on {submission.gradedAt ? new Date(submission.gradedAt).toLocaleString() : 'Unknown date'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    placeholder="Enter grade (0-100)"
                                    value={grading.grade}
                                    onChange={(e) => setGrading({ ...grading, grade: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    min="0"
                                    max="100"
                                />
                                <textarea
                                    placeholder="Enter feedback (optional)"
                                    value={grading.feedback}
                                    onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                />
                                <button
                                    onClick={() => handleGradeSubmission(submission.id || submission._id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
                                    disabled={!grading.grade}
                                >
                                    Submit Grade
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    console.log('🎨 RENDERING MODAL:', {
        loading,
        error,
        submissions: submissions.length,
        selectedSubmission: !!selectedSubmission,
        userRole,
        userEmail
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {userRole === 'teacher' ?
                            `All Submissions for "${task?.title || task || 'Task'}"` :
                            'Your Submission'
                        }
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MdClose className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Debug Panel (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-yellow-100 border-b p-3 text-xs">
                        <details>
                            <summary className="cursor-pointer font-semibold">Debug Information</summary>
                            <div className="mt-2 space-y-1">
                                <div><strong>User:</strong> {userEmail} ({userRole})</div>
                                <div><strong>Task:</strong> {taskId}</div>
                                <div><strong>Classroom:</strong> {classroomId}</div>
                                <div><strong>Submissions:</strong> {submissions.length}</div>
                                <div><strong>Selected:</strong> {selectedSubmission ? 'Yes' : 'No'}</div>
                                <div><strong>Loading:</strong> {String(loading)}</div>
                                <div><strong>Error:</strong> {error || 'None'}</div>
                                <div><strong>API Base URL:</strong> {apiConfig.baseURL}</div>
                                {debugInfo.timestamp && (
                                    <div><strong>Last Fetch:</strong> {debugInfo.timestamp}</div>
                                )}
                                {debugInfo.apiUrl && (
                                    <div><strong>API URL:</strong> {debugInfo.apiUrl}</div>
                                )}
                            </div>
                        </details>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-auto max-h-[calc(90vh-200px)]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2">Loading submissions...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                                <MdWarning className="mx-auto text-3xl mb-2" />
                                <h3 className="font-semibold mb-2">Error Loading Submissions</h3>
                                <p className="mb-4">{error}</p>
                                <div className="text-xs text-gray-600 mb-4">
                                    API Base URL: {apiConfig.baseURL}
                                </div>
                                <button
                                    onClick={fetchSubmissions}
                                    className="flex items-center mx-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    <MdRefresh className="mr-2" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <MdWarning className="mx-auto text-3xl mb-2 text-gray-400" />
                                <h3 className="font-semibold mb-2">No Submissions Found</h3>
                                <p>No submissions have been made for this task yet.</p>
                                {userRole === 'student' && (
                                    <p className="mt-2 text-sm">
                                        If you've submitted work, please check that you're logged in with the correct account.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {userRole === 'teacher' ? (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                                        <p className="text-purple-800 font-medium">
                                            👨‍🏫 Teacher View - Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {submissions.map((submission, index) => (
                                        <div key={submission.id || submission._id || submission.studentEmail || index} className="border-b pb-6 last:border-b-0">
                                            {renderSubmissionDetails(submission, index)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                selectedSubmission ? (
                                    <div>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                            <p className="text-green-800 font-medium">
                                                ✅ Your Submission Found
                                            </p>
                                        </div>
                                        {renderSubmissionDetails(selectedSubmission, 0)}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                            <MdWarning className="mx-auto text-3xl mb-2 text-yellow-600" />
                                            <h3 className="font-semibold mb-2">No Submission Found</h3>
                                            <p>We couldn't find your submission for this task.</p>
                                            <p className="text-sm mt-2">
                                                Email: {userEmail} | Available submissions: {submissions.length}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSubmissionModal;
