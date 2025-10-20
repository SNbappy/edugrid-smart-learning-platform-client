import Swal from 'sweetalert2';

/**
 * Dynamic API Configuration Service
 */
class TaskAPIConfig {
    constructor() {
        this.baseURL = this.getBaseURL();
    }

    getBaseURL() {
        // Check environment variables first
        if (import.meta.env.VITE_API_BASE_URL) {
            return import.meta.env.VITE_API_BASE_URL;
        }

        // Runtime environment for containers
        if (window._ENV_?.VITE_API_BASE_URL) {
            return window._ENV_.VITE_API_BASE_URL;
        }

        // Development detection
        if (process.env.NODE_ENV === 'development') {
            const hostname = window.location.hostname;
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                // return 'https://edugrid-smart-learning-platform-ser.vercel.app';
                return 'http://localhost:5000';
            }
            return `http://${hostname}:5000`;
        }

        // Production detection
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        return `${protocol}//${hostname}`;
    }

    // Build complete API URL
    buildURL(endpoint) {
        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

        // Add /api prefix if not present
        const apiEndpoint = cleanEndpoint.startsWith('api/') ? cleanEndpoint : `api/${cleanEndpoint}`;

        return `${this.baseURL}/${apiEndpoint}`;
    }

    // Debug information
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

// Create singleton instance
const apiConfig = new TaskAPIConfig();

console.log('🔧 Task API Configuration:', apiConfig.getDebugInfo());

/**
 * Enhanced axios wrapper with dynamic URL building
 */
const makeAPICall = async (axiosPublic, method, endpoint, data = null, options = {}) => {
    try {
        const fullURL = apiConfig.buildURL(endpoint);
        console.log(`📡 ${method.toUpperCase()} API Call:`, {
            endpoint,
            fullURL,
            hasData: !!data
        });

        let response;
        switch (method.toLowerCase()) {
            case 'get':
                response = await axiosPublic.get(fullURL, options);
                break;
            case 'post':
                response = await axiosPublic.post(fullURL, data, options);
                break;
            case 'put':
                response = await axiosPublic.put(fullURL, data, options);
                break;
            case 'delete':
                response = await axiosPublic.delete(fullURL, options);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }

        console.log(`📥 ${method.toUpperCase()} Response:`, {
            status: response.status,
            success: response.data?.success,
            url: fullURL
        });

        return response;
    } catch (error) {
        console.error(`❌ ${method.toUpperCase()} API Error:`, {
            endpoint,
            fullURL: apiConfig.buildURL(endpoint),
            error: error.message,
            response: error.response?.data
        });
        throw error;
    }
};

/**
 * Create a new task via API
 */
export const createTaskAPI = async (axiosPublic, classroomId, taskData, userEmail) => {
    try {
        console.log('Creating task with data:', taskData);

        const taskPayload = {
            ...taskData,
            createdBy: userEmail
        };

        const response = await makeAPICall(
            axiosPublic,
            'post',
            `classrooms/${classroomId}/tasks`,
            taskPayload
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Task created successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true,
                task: response.data.task
            };
        } else {
            throw new Error(response.data.message || 'Failed to create task');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to create task.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Delete a task via API
 */
export const deleteTaskAPI = async (axiosPublic, classroomId, taskId) => {
    try {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Delete Task?',
            text: 'This will remove the task and all submissions.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return { success: false, cancelled: true };
        }

        console.log('Deleting task:', taskId);

        const response = await makeAPICall(
            axiosPublic,
            'delete',
            `classrooms/${classroomId}/tasks/${taskId}`
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Deleted!',
                text: 'Task has been deleted.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true
            };
        } else {
            throw new Error(response.data.message || 'Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to delete task.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Update a task via API
 */
export const updateTaskAPI = async (axiosPublic, classroomId, taskId, updateData) => {
    try {
        console.log('Updating task:', taskId, updateData);

        const response = await makeAPICall(
            axiosPublic,
            'put',
            `classrooms/${classroomId}/tasks/${taskId}`,
            updateData
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Task updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true,
                task: response.data.task
            };
        } else {
            throw new Error(response.data.message || 'Failed to update task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to update task.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get task submissions via API - THIS IS THE KEY FIX FOR YOUR ISSUE
 */
export const getTaskSubmissionsAPI = async (axiosPublic, classroomId, taskId) => {
    try {
        console.log('🎯 Fetching task submissions:', { classroomId, taskId });

        const response = await makeAPICall(
            axiosPublic,
            'get',
            `classrooms/${classroomId}/tasks/${taskId}/submissions`
        );

        console.log('📋 Task submissions response:', {
            success: response.data.success,
            count: response.data.count,
            submissions: response.data.submissions?.length || 0
        });

        if (response.data.success) {
            return {
                success: true,
                submissions: response.data.submissions,
                count: response.data.count,
                userRole: response.data.userRole
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch submissions');
        }
    } catch (error) {
        console.error('❌ Error fetching task submissions:', error);
        return {
            success: false,
            error: error.message,
            debug: {
                classroomId,
                taskId,
                fullURL: apiConfig.buildURL(`classrooms/${classroomId}/tasks/${taskId}/submissions`)
            }
        };
    }
};

/**
 * Submit a task via API
 */
export const submitTaskAPI = async (axiosPublic, classroomId, taskId, submissionData) => {
    try {
        console.log('🎯 Submitting task:', { classroomId, taskId, submissionData });

        const response = await makeAPICall(
            axiosPublic,
            'post',
            `classrooms/${classroomId}/tasks/${taskId}/submit`,
            submissionData
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Task submitted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true,
                submission: response.data.submission
            };
        } else {
            throw new Error(response.data.message || 'Failed to submit task');
        }
    } catch (error) {
        console.error('❌ Error submitting task:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to submit task.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Resubmit a task via API
 */
export const resubmitTaskAPI = async (axiosPublic, classroomId, taskId, submissionData) => {
    try {
        console.log('🔄 Resubmitting task:', { classroomId, taskId });

        const response = await makeAPICall(
            axiosPublic,
            'put',
            `classrooms/${classroomId}/tasks/${taskId}/submit`,
            { ...submissionData, isResubmission: true }
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Task resubmitted successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true,
                submission: response.data.submission
            };
        } else {
            throw new Error(response.data.message || 'Failed to resubmit task');
        }
    } catch (error) {
        console.error('❌ Error resubmitting task:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to resubmit task.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Grade a submission via API
 */
export const gradeSubmissionAPI = async (axiosPublic, classroomId, taskId, submissionId, gradeData) => {
    try {
        console.log('📝 Grading submission:', { classroomId, taskId, submissionId, gradeData });

        const response = await makeAPICall(
            axiosPublic,
            'put',
            `classrooms/${classroomId}/tasks/${taskId}/submissions/${submissionId}/grade`,
            gradeData
        );

        if (response.data.success) {
            Swal.fire({
                title: 'Success!',
                text: 'Submission graded successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return {
                success: true
            };
        } else {
            throw new Error(response.data.message || 'Failed to grade submission');
        }
    } catch (error) {
        console.error('❌ Error grading submission:', error);
        Swal.fire({
            title: 'Error!',
            text: error.response?.data?.message || 'Failed to grade submission.',
            icon: 'error'
        });

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get user's own submission for a task
 */
export const getMySubmissionAPI = async (axiosPublic, classroomId, taskId) => {
    try {
        console.log('👤 Fetching my submission:', { classroomId, taskId });

        const response = await makeAPICall(
            axiosPublic,
            'get',
            `classrooms/${classroomId}/tasks/${taskId}/my-submission`
        );

        if (response.data.success) {
            return {
                success: true,
                submission: response.data.submission,
                hasSubmission: response.data.hasSubmission
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch submission');
        }
    } catch (error) {
        console.error('❌ Error fetching my submission:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Get submission status for a task
 */
export const getSubmissionStatusAPI = async (axiosPublic, classroomId, taskId) => {
    try {
        console.log('📊 Fetching submission status:', { classroomId, taskId });

        const response = await makeAPICall(
            axiosPublic,
            'get',
            `classrooms/${classroomId}/tasks/${taskId}/submission-status`
        );

        if (response.data.success) {
            return {
                success: true,
                status: response.data.status
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch submission status');
        }
    } catch (error) {
        console.error('❌ Error fetching submission status:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Export API configuration for debugging
export { apiConfig };