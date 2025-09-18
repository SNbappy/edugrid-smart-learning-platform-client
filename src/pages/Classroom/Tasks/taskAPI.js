import Swal from 'sweetalert2';

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

        const response = await axiosPublic.post(`/classrooms/${classroomId}/tasks`, taskPayload);
        console.log('Create task response:', response.data);

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

        const response = await axiosPublic.delete(`/classrooms/${classroomId}/tasks/${taskId}`);
        console.log('Delete task response:', response.data);

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

        const response = await axiosPublic.put(`/classrooms/${classroomId}/tasks/${taskId}`, updateData);
        console.log('Update task response:', response.data);

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
 * Get task submissions via API
 */
export const getTaskSubmissionsAPI = async (axiosPublic, classroomId, taskId) => {
    try {
        console.log('Fetching task submissions:', { classroomId, taskId });

        const response = await axiosPublic.get(`/classrooms/${classroomId}/tasks/${taskId}/submissions`);
        console.log('Task submissions response:', response.data);

        if (response.data.success) {
            return {
                success: true,
                submissions: response.data.submissions,
                count: response.data.count
            };
        } else {
            throw new Error(response.data.message || 'Failed to fetch submissions');
        }
    } catch (error) {
        console.error('Error fetching task submissions:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
