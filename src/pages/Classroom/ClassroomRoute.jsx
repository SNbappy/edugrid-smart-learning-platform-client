import { Navigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../../providers/AuthProvider';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const ClassroomRoute = ({ children }) => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const axiosPublic = useAxiosPublic();

    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    // const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // console.log('🔍 Checking access for user:', user.email);
                // console.log('🔍 Classroom ID:', classroomId);

                // Fetch classroom data
                const response = await axiosPublic.get(`/classrooms/${classroomId}`);
                // console.log('📦 Full classroom response:', response.data);

                // Handle different response formats
                const classroom = response.data.classroom || response.data;

                // console.log('🏫 Classroom data:', classroom);
                // console.log('🔍 FULL CLASSROOM OBJECT:', JSON.stringify(classroom, null, 2));
                // console.log('👤 Current user email:', user.email);

                // Normalize user email for comparison
                const userEmailNormalized = user.email?.trim().toLowerCase();

                // Log all possible creator fields
                // console.log('🔍 Creator field values:', {
                //     creatorEmail: classroom.creatorEmail,
                //     teacher: classroom.teacher,
                //     owner: classroom.owner,
                //     createdBy: classroom.createdBy,
                //     creator: classroom.creator,
                //     teacherEmail: classroom.teacherEmail,
                //     ownerEmail: classroom.ownerEmail,
                //     userId: classroom.userId,
                //     userEmail: user.email,
                //     userEmailNormalized
                // });

                // Check all possible creator/owner fields (expanded list)
                const creatorFields = [
                    classroom.creatorEmail,
                    classroom.teacher,
                    classroom.owner,
                    classroom.createdBy,
                    classroom.creator,
                    classroom.teacherEmail,
                    classroom.ownerEmail,
                    classroom.userId,
                    classroom.user?.email,
                    classroom.createdByUser?.email
                ];

                const isCreator = creatorFields.some(field => {
                    if (!field) return false;
                    return field.toString().trim().toLowerCase() === userEmailNormalized;
                });

                // console.log('✅ Is Creator?', isCreator);

                // Check if user is a member
                let isMember = false;

                if (Array.isArray(classroom.members)) {
                    // console.log('👥 Members array:', classroom.members);

                    isMember = classroom.members.some(member => {
                        if (typeof member === 'string') {
                            return member.trim().toLowerCase() === userEmailNormalized;
                        }
                        return member.email?.trim().toLowerCase() === userEmailNormalized;
                    });
                }

                // Check students array as fallback
                if (!isMember && Array.isArray(classroom.students)) {
                    // console.log('👨‍🎓 Students array:', classroom.students);

                    isMember = classroom.students.some(student => {
                        if (typeof student === 'string') {
                            return student.trim().toLowerCase() === userEmailNormalized;
                        }
                        return student.email?.trim().toLowerCase() === userEmailNormalized;
                    });
                }

                // console.log('✅ Is Member?', isMember);

                const accessGranted = isCreator || isMember;
                // console.log('🎯 Final access decision:', accessGranted);

                // Store debug info
                // setDebugInfo({
                //     userEmail: user.email,
                //     userEmailNormalized,
                //     classroomId,
                //     isCreator,
                //     isMember,
                //     accessGranted,
                //     classroom: {
                //         name: classroom.name,
                //         allFields: Object.keys(classroom),
                //         creatorEmail: classroom.creatorEmail,
                //         teacher: classroom.teacher,
                //         owner: classroom.owner,
                //         createdBy: classroom.createdBy,
                //         membersCount: classroom.members?.length || 0,
                //         studentsCount: classroom.students?.length || 0
                //     }
                // });

                setHasAccess(accessGranted);

                // Show alert if access denied
                if (!accessGranted) {
                    console.error('❌ NO CREATOR FIELD FOUND! Available fields:', Object.keys(classroom));

                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        // html: `
                        //     <p>You do not have permission to access this classroom.</p>
                        //     // <details style="margin-top: 10px; text-align: left;">
                        //     //     // <summary style="cursor: pointer; font-weight: bold;">Debug Info (for developers)</summary>
                        //     //     <pre style="margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; font-size: 12px; overflow-x: auto;">Available fields: ${Object.keys(classroom).join(', ')}</pre>
                        //     // </details>
                        // `,
                        confirmButtonColor: '#457B9D'
                    });
                }

            } catch (error) {
                console.error('❌ Error checking classroom access:', error);
                console.error('Error response:', error.response?.data);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to verify classroom access. Please try again.',
                    confirmButtonColor: '#457B9D'
                });

                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            checkAccess();
        }
    }, [user, classroomId, authLoading, axiosPublic]);

    // Show loading spinner
    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#DCE8F5]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-[#457B9D]"></span>
                    <p className="mt-4 text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to dashboard if no access
    if (!hasAccess) {
        // console.log('🚫 Access denied, redirecting to dashboard');
        // console.log('Debug info:', debugInfo);
        return <Navigate to="/dashboard" replace />;
    }

    // Allow access
    // console.log('✅ Access granted, rendering children');
    return children;
};

export default ClassroomRoute;
