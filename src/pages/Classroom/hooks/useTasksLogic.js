import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getTaskStatus, calculateTaskStats } from '../Tasks/taskUtils';
import { createTaskAPI, deleteTaskAPI } from '../Tasks/taskAPI';

export const useTasksLogic = (user, classroomId, axiosPublic, loading) => {
    const navigate = useNavigate();
    const [classroom, setClassroom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [userRole, setUserRole] = useState('student');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    // Submission states
    const [showSubmissionView, setShowSubmissionView] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showAllSubmissionsView, setShowAllSubmissionsView] = useState(false);
    const [allSubmissions, setAllSubmissions] = useState([]);

    // IMPROVED: Use the same approach as AttendancePage - check backend data directly
    const isOwner = useCallback(() => {
        if (!classroom || !user) return false;

        // Check multiple possible owner/teacher fields from backend
        const possibleOwnerFields = [
            classroom.owner,
            classroom.teacher,
            classroom.instructor,
            classroom.createdBy,
            classroom.teacherEmail,
            classroom.createdByEmail,
            classroom.ownerEmail
        ];

        // Check if user email matches any owner field (case insensitive)
        const isDirectOwner = possibleOwnerFields.some(field =>
            field && field.toLowerCase().trim() === user.email?.toLowerCase().trim()
        );

        // Check if user is in teachers array (if it exists)
        const isInTeachersArray = classroom.teachers && Array.isArray(classroom.teachers) &&
            classroom.teachers.some(teacher => {
                if (typeof teacher === 'string') {
                    return teacher.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                if (typeof teacher === 'object' && teacher.email) {
                    return teacher.email.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                return false;
            });

        // Check if user is in instructors array (if it exists)
        const isInInstructorsArray = classroom.instructors && Array.isArray(classroom.instructors) &&
            classroom.instructors.some(instructor => {
                if (typeof instructor === 'string') {
                    return instructor.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                if (typeof instructor === 'object' && instructor.email) {
                    return instructor.email.toLowerCase().trim() === user.email?.toLowerCase().trim();
                }
                return false;
            });

        // Check if user has teacher/owner role in members array
        const hasTeacherRole = classroom.members && Array.isArray(classroom.members) &&
            classroom.members.some(member => {
                const emailMatch = member.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
                    member.userId === user.uid;
                const teacherRoles = ['owner', 'teacher', 'instructor', 'admin'];
                return emailMatch && teacherRoles.includes(member.role?.toLowerCase());
            });

        return isDirectOwner || isInTeachersArray || isInInstructorsArray || hasTeacherRole;
    }, [classroom, user]);

    // ENHANCED: Debug logging similar to AttendancePage
    useEffect(() => {
        if (classroom && user && process.env.NODE_ENV === 'development') {
            // console.log('=== TASKS DEBUG INFO ===');
            // console.log('Classroom data:', {
            //     id: classroom._id || classroom.id,
            //     name: classroom.name,
            //     owner: classroom.owner,
            //     teacher: classroom.teacher,
            //     createdBy: classroom.createdBy,
            //     teachers: classroom.teachers,
            //     instructors: classroom.instructors,
            //     members: classroom.members
            // });
            // console.log('Current user:', {
            //     email: user.email,
            //     uid: user.uid,
            //     displayName: user.displayName
            // });
            // console.log('Owner check result:', isOwner());
            // console.log('=========================');
        }
    }, [classroom, user, isOwner]);

    // SIMPLIFIED: Fetch classroom data directly from backend
    useEffect(() => {
        const fetchData = async () => {
            // console.log('📡 STARTING DATA FETCH:', {
            //     classroomId,
            //     userEmail: user?.email,
            //     loading,
            //     timestamp: new Date().toISOString()
            // });

            try {
                setIsLoading(true);
                const response = await axiosPublic.get(`/classrooms/${classroomId}`);

                // console.log('📨 CLASSROOM API RESPONSE:', {
                //     success: response.data.success,
                //     classroomId: response.data.classroom?._id || response.data.classroom?.id,
                //     classroomName: response.data.classroom?.name,
                //     hasTasksData: !!response.data.classroom?.tasks,
                //     tasksCount: response.data.classroom?.tasks?.assignments?.length || 0
                // });

                if (response.data.success) {
                    const classroomData = response.data.classroom;

                    // Set classroom data directly from backend
                    setClassroom(classroomData);
                    setTasks(classroomData.tasks?.assignments || []);

                    // console.log('✅ DATA FETCH COMPLETED:', {
                    //     classroomId: classroomData._id || classroomData.id,
                    //     classroomName: classroomData.name,
                    //     tasksLoaded: (classroomData.tasks?.assignments || []).length,
                    //     timestamp: new Date().toISOString()
                    // });
                }
            } catch (error) {
                console.error('❌ ERROR FETCHING CLASSROOM:', {
                    error: error.message,
                    classroomId,
                    userEmail: user?.email,
                    timestamp: new Date().toISOString()
                });

                Swal.fire('Error!', 'Failed to load classroom data.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
                // console.log('🏁 FETCH OPERATION COMPLETED:', {
                //     classroomId,
                //     timestamp: new Date().toISOString()
                // });
            }
        };

        if (!loading && user && classroomId) {
            // console.log('🎯 FETCH CONDITIONS MET:', {
            //     loading,
            //     hasUser: !!user,
            //     hasClassroomId: !!classroomId,
            //     userEmail: user?.email
            // });
            fetchData();
        } else {
            // console.log('⏳ FETCH CONDITIONS NOT MET:', {
            //     loading,
            //     hasUser: !!user,
            //     hasClassroomId: !!classroomId,
            //     reason: 'Waiting for required data'
            // });
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // IMPROVED: Set userRole based on backend data check
    useEffect(() => {
        if (classroom && user) {
            const role = isOwner() ? 'teacher' : 'student';
            setUserRole(role);

            // console.log('🎭 ROLE DETERMINED FROM BACKEND DATA:', {
            //     finalRole: role,
            //     userEmail: user.email,
            //     classroomId: classroom._id || classroom.id,
            //     classroomName: classroom.name,
            //     timestamp: new Date().toISOString()
            // });
        }
    }, [classroom, user, isOwner]);

    // Helper functions
    const hasUserSubmitted = (task, userEmail) =>
        task.submissions?.some(sub => sub.studentEmail === userEmail);

    const getUserSubmission = (task, userEmail) =>
        task.submissions?.find(sub => sub.studentEmail === userEmail);

    // Create task (with proper owner check)
    const createTask = async (taskData) => {
        try {
            // Verify ownership before creating
            if (!isOwner()) {
                Swal.fire('Access Denied!', 'Only the classroom teacher can create tasks.', 'error');
                return;
            }

            // console.log('🎯 Creating task with role:', userRole, 'Data:', taskData);
            const result = await createTaskAPI(axiosPublic, classroomId, taskData, user.email);

            if (result.success) {
                setTasks(prev => [...prev, result.task]);
                setShowCreateTask(false);

                Swal.fire({
                    title: 'Success!',
                    text: 'Task created successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error creating task:', error);
            Swal.fire('Error!', 'Failed to create task.', 'error');
        }
    };

    // Delete task (with proper owner check)
    const deleteTask = async (taskId) => {
        try {
            // Verify ownership before deleting
            if (!isOwner()) {
                Swal.fire('Access Denied!', 'Only the classroom teacher can delete tasks.', 'error');
                return;
            }

            const confirmResult = await Swal.fire({
                title: 'Delete Task?',
                text: 'This action cannot be undone.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#457B9D',
                confirmButtonText: 'Yes, delete it!'
            });

            if (!confirmResult.isConfirmed) return;

            const result = await deleteTaskAPI(axiosPublic, classroomId, taskId);
            if (result.success) {
                setTasks(prev => prev.filter(task => (task._id || task.id) !== taskId));
                Swal.fire('Deleted!', 'Task deleted successfully.', 'success');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            Swal.fire('Error!', 'Failed to delete task.', 'error');
        }
    };

    // Submit task
    // Submit task - FIXED VERSION
    // Submit task - FIXED VERSION
    // Submit task - FIXED VERSION with proper payload validation
    // Submit task - FIXED VERSION with proper payload validation
    const submitTask = async (taskId, submissionData, isResubmission = false) => {
        try {
            const task = tasks.find(t => (t._id || t.id) === taskId);
            const alreadySubmitted = hasUserSubmitted(task, user.email);

            if (alreadySubmitted && !isResubmission) {
                const result = await Swal.fire({
                    title: 'Already Submitted!',
                    text: 'Do you want to resubmit and replace your previous submission?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#457B9D',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, resubmit',
                    cancelButtonText: 'Cancel'
                });

                if (!result.isConfirmed) return { success: false, cancelled: true };
            }

            // ENHANCED: Validate all required fields
            if (!taskId) {
                throw new Error('Task ID is required');
            }
            if (!classroomId) {
                throw new Error('Classroom ID is required');
            }
            if (!user?.email) {
                throw new Error('User email is required');
            }
            if (!submissionData) {
                throw new Error('Submission data is required');
            }

            // FIXED: Create properly formatted payload
            const payload = {
                taskId, // Include taskId in payload
                studentEmail: user.email,
                studentName: user.displayName || user.email,
                isResubmission: alreadySubmitted || isResubmission,
                // Ensure submission data is properly structured
                text: submissionData.text || '',
                fileUrl: submissionData.fileUrl || null,
                submittedAt: new Date().toISOString()
            };

            // Remove any undefined or null values
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });

            const endpoint = `/classrooms/${classroomId}/tasks/${taskId}/submit`;

            // console.log('📤 SUBMISSION DEBUG:', {
            //     endpoint,
            //     method: 'POST',
            //     payload,
            //     taskId,
            //     classroomId,
            //     userEmail: user.email,
            //     isResubmission: alreadySubmitted || isResubmission
            // });

            // Make the API call
            const response = await axiosPublic.post(endpoint, payload);

            // console.log('✅ SUBMISSION SUCCESS:', response.data);

            if (response.data.success) {
                // Update local state immediately
                const newSubmission = {
                    id: response.data.submissionId || Date.now().toString(),
                    studentEmail: user.email,
                    studentName: user.displayName || user.email,
                    submittedAt: new Date().toISOString(),
                    text: submissionData.text || '',
                    fileUrl: submissionData.fileUrl || null,
                    isResubmission: alreadySubmitted || isResubmission
                };

                setTasks(prevTasks =>
                    prevTasks.map(t => {
                        if ((t._id || t.id) === taskId) {
                            let updatedSubmissions = [...(t.submissions || [])];

                            if (alreadySubmitted || isResubmission) {
                                // Replace existing submission
                                updatedSubmissions = updatedSubmissions.map(sub =>
                                    sub.studentEmail === user.email ? newSubmission : sub
                                );
                            } else {
                                // Add new submission
                                updatedSubmissions.push(newSubmission);
                            }

                            return { ...t, submissions: updatedSubmissions };
                        }
                        return t;
                    })
                );

                // Refresh from backend after a delay
                setTimeout(async () => {
                    try {
                        const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                        if (classroomResponse.data.success) {
                            setTasks(classroomResponse.data.classroom.tasks?.assignments || []);
                            // console.log('✅ Tasks refreshed from backend after submission');
                        }
                    } catch (error) {
                        console.error('Error refreshing tasks:', error);
                    }
                }, 1000);

                const successMessage = (alreadySubmitted || isResubmission)
                    ? 'Assignment resubmitted successfully.'
                    : 'Assignment submitted successfully.';

                Swal.fire({
                    title: 'Success!',
                    text: successMessage,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                return { success: true };
            }
        } catch (error) {
            console.error('❌ SUBMISSION ERROR:', {
                error: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data
                }
            });

            // Enhanced error handling
            let errorMessage = 'Failed to submit assignment. Please try again.';

            if (error.response?.status === 400) {
                const backendError = error.response?.data?.message || error.response?.data?.error;
                if (backendError) {
                    errorMessage = `Submission failed: ${backendError}`;
                } else {
                    errorMessage = 'Invalid submission data. Please check your input and try again.';
                }
            } else if (error.response?.status === 404) {
                errorMessage = 'Submission endpoint not found. Please contact support.';
            }

            Swal.fire('Error!', errorMessage, 'error');
            return { success: false, error: error.message };
        }
    };






    // Rest of the methods remain the same...
    const viewSubmission = async (taskId) => {
        try {
            const task = tasks.find(t => (t._id || t.id) === taskId);
            const userSubmission = getUserSubmission(task, user.email);

            if (!userSubmission) {
                Swal.fire({
                    title: 'No Submission Found',
                    text: 'You have not submitted this task yet.',
                    icon: 'info'
                });
                return;
            }

            setSelectedSubmission({
                taskId,
                taskTitle: task.title,
                submission: userSubmission,
                canEdit: userRole !== 'teacher',
                isOwnSubmission: true
            });
            setShowSubmissionView(true);
        } catch (error) {
            console.error('Error viewing submission:', error);
            Swal.fire('Error!', 'Failed to load submission.', 'error');
        }
    };

    const viewAllSubmissions = async (taskId) => {
        if (!isOwner()) {
            Swal.fire({
                title: 'Access Denied',
                text: 'Only instructors can view all submissions.',
                icon: 'error'
            });
            return;
        }

        try {
            const task = tasks.find(t => (t._id || t.id) === taskId);

            if (!task.submissions || task.submissions.length === 0) {
                Swal.fire({
                    title: 'No Submissions',
                    text: 'No students have submitted this task yet.',
                    icon: 'info'
                });
                return;
            }

            setAllSubmissions({
                taskId,
                taskTitle: task.title,
                submissions: task.submissions || []
            });
            setShowAllSubmissionsView(true);
        } catch (error) {
            console.error('Error fetching all submissions:', error);
            Swal.fire('Error!', 'Failed to load submissions.', 'error');
        }
    };

    // Helper functions
    const canViewSubmission = (task, userEmail, userRole) =>
        userRole === 'teacher' || hasUserSubmitted(task, userEmail);

    const getSubmissionCount = (task) => task.submissions?.length || 0;
    const allowsResubmission = (task) => task.allowResubmission !== false;

    // Computed values
    const filteredTasks = filterStatus === 'all'
        ? tasks
        : tasks.filter(task => getTaskStatus(task) === filterStatus);

    const taskStats = calculateTaskStats(tasks);

    return {
        // Core data
        classroom,
        tasks,
        isLoading,
        userRole,
        taskStats,
        filteredTasks,
        isOwner, // Export the isOwner function for use in components

        // Task creation/management
        showCreateTask,
        setShowCreateTask,
        createTask,
        deleteTask,

        // Task filtering
        filterStatus,
        setFilterStatus,

        // Task submission
        submitTask,
        hasUserSubmitted,
        getUserSubmission,
        allowsResubmission,

        // Submission viewing
        showSubmissionView,
        setShowSubmissionView,
        selectedSubmission,
        viewSubmission,
        canViewSubmission,

        // All submissions (teacher view)
        showAllSubmissionsView,
        setShowAllSubmissionsView,
        allSubmissions,
        viewAllSubmissions,
        getSubmissionCount
    };
};
