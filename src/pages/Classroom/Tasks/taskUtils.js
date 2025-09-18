// Utility functions for task operations

/**
 * Get task status based on due date and current status
 */
export const getTaskStatus = (task) => {
    const now = new Date();
    const dueDate = new Date(task.dueDate);

    if (task.status === 'completed') return 'completed';
    if (now > dueDate) return 'overdue';
    if (now.getTime() - dueDate.getTime() < 24 * 60 * 60 * 1000) return 'due-soon';
    return 'active';
};

/**
 * Calculate task statistics
 */
export const calculateTaskStats = (tasks) => {
    return {
        total: tasks.length,
        active: tasks.filter(task => getTaskStatus(task) === 'active').length,
        overdue: tasks.filter(task => getTaskStatus(task) === 'overdue').length,
        completed: tasks.filter(task => getTaskStatus(task) === 'completed').length
    };
};

/**
 * Format date for display
 */
export const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calculate days until due date
 */
export const calculateDaysUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Get submission percentage
 */
export const getSubmissionPercentage = (submissionCount, studentCount) => {
    if (studentCount === 0) return 0;
    return Math.round((submissionCount / studentCount) * 100);
};
