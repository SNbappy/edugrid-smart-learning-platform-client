import React, { useState, useEffect } from 'react';
import { MdClose, MdDownload, MdVisibility, MdCheckCircle, MdPeople } from 'react-icons/md';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const ViewSubmissionModal = ({
    taskId,
    classroomId,
    isOpen,
    onClose,
    userRole,
    userEmail,
    task // Pass the entire task object to avoid API calls
}) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const axiosPublic = useAxiosPublic();

    const fetchSubmissions = async () => {
        if (!taskId || !classroomId) {
            console.error('Missing required props:', { taskId, classroomId });
            setError('Missing required information');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('Fetching submissions for:', { taskId, classroomId });

            const response = await axiosPublic.get(
                `/classrooms/${classroomId}/tasks/${taskId}/submissions`
            );

            if (response.data.success) {
                setSubmissions(response.data.submissions || []);
            } else {
                setError('Failed to load submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Use existing task data if available, otherwise fetch
            if (task && task.submissions) {
                setSubmissions(task.submissions);
                setLoading(false);
                setError(null);
            } else if (taskId && classroomId) {
                fetchSubmissions();
            }
        }
    }, [isOpen, taskId, classroomId, task]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const userSubmissions = submissions.filter(sub => sub.studentEmail === userEmail);
    const isTeacher = userRole === 'teacher';

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isTeacher ? 'All Submissions' : 'Your Submission'}
                        </h2>
                        {task && (
                            <p className="text-gray-600 mt-1">Task: {task.title}</p>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center text-blue-600">
                            <MdPeople className="mr-2" />
                            <span className="font-medium">
                                {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
                            </span>
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
                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading submissions...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <div className="text-red-500 text-6xl mb-4">⚠️</div>
                            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Submissions</h3>
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && submissions.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Submissions Yet</h3>
                            <p className="text-gray-500">
                                {isTeacher ? 'Students haven\'t submitted this task yet.' : 'You haven\'t submitted this task yet.'}
                            </p>
                        </div>
                    )}

                    {!loading && !error && submissions.length > 0 && (
                        <div className="space-y-6">
                            {isTeacher ? (
                                // Teacher view - show all submissions
                                <div className="grid gap-6">
                                    {submissions.map((submission, index) => (
                                        <div key={submission.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <MdCheckCircle className="text-green-500 text-2xl" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
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
                                            </div>

                                            {/* Submission Content */}
                                            <div className="space-y-4">
                                                {submission.text && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-2">Text Submission:</h4>
                                                        <div className="bg-gray-50 p-4 rounded-lg border text-gray-800 whitespace-pre-wrap">
                                                            {submission.text}
                                                        </div>
                                                    </div>
                                                )}

                                                {submission.fileUrl && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-700 mb-2">File Attachment:</h4>
                                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                            <div className="flex-1">
                                                                <p className="text-blue-800 font-medium">📎 File attached</p>
                                                                <p className="text-blue-600 text-sm">Click to view or download</p>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <a
                                                                    href={submission.fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                                                                >
                                                                    <MdVisibility className="mr-1" />
                                                                    View
                                                                </a>
                                                                <a
                                                                    href={submission.fileUrl}
                                                                    download
                                                                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                                                                >
                                                                    <MdDownload className="mr-1" />
                                                                    Download
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Student view - show only their submissions
                                <div className="space-y-4">
                                    {userSubmissions.length === 0 ? (
                                        <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <p className="text-yellow-800">You haven't submitted this task yet.</p>
                                        </div>
                                    ) : (
                                        userSubmissions.map((submission, index) => (
                                            <div key={submission.id || index} className="bg-green-50 border border-green-200 rounded-xl p-6">
                                                <div className="flex items-center mb-4">
                                                    <MdCheckCircle className="text-green-500 text-2xl mr-3" />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-green-800">Your Submission</h3>
                                                        <p className="text-sm text-green-600">
                                                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                                        </p>
                                                        {submission.isResubmission && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                                                Resubmission
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Student's Submission Content */}
                                                <div className="space-y-4">
                                                    {submission.text && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-700 mb-2">Your Text:</h4>
                                                            <div className="bg-white p-4 rounded-lg border text-gray-800 whitespace-pre-wrap">
                                                                {submission.text}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {submission.fileUrl && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-700 mb-2">Your File:</h4>
                                                            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <div className="flex-1">
                                                                    <p className="text-blue-800 font-medium">📎 Your submitted file</p>
                                                                    <p className="text-blue-600 text-sm">Click to view or download</p>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <a
                                                                        href={submission.fileUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                                                                    >
                                                                        <MdVisibility className="mr-1" />
                                                                        View
                                                                    </a>
                                                                    <a
                                                                        href={submission.fileUrl}
                                                                        download
                                                                        className="flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                                                                    >
                                                                        <MdDownload className="mr-1" />
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                        <p className="text-yellow-800 text-sm">
                                                            🔒 <strong>Privacy:</strong> Your submission is only visible to you and the instructor.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Role indicator */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 text-center">
                                    {isTeacher ?
                                        '👨‍🏫 You are viewing all submissions as an instructor.' :
                                        '👨‍🎓 You are viewing your own submission.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        {isTeacher ?
                            `Total: ${submissions.length} submission${submissions.length !== 1 ? 's' : ''}` :
                            userSubmissions.length > 0 ? 'Submission submitted successfully' : 'No submission yet'
                        }
                    </div>
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

export default ViewSubmissionModal;
