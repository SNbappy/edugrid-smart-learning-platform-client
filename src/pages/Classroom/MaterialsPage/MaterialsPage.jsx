import React, { useContext, useState, useCallback, useEffect } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from '../../Dashboard/Dashboard/Sidebar';
import { MdArrowBack, MdAdd } from 'react-icons/md';

// Import custom hooks and components
import { useMaterials } from './hooks/useMaterials';
import MaterialStats from './components/MaterialStats';
import MaterialsGrid from './components/MaterialsGrid';
import AddMaterialModal from './components/AddMaterialModal';
import { calculateMaterialStats, filterMaterialsByType } from './utils/materialHelpers';

const MaterialsPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [filterType, setFilterType] = useState('all');

    // Use custom hook for materials management
    const {
        classroom,
        materials = [],
        isLoading,
        addMaterial,
        deleteMaterial
    } = useMaterials(classroomId, user, loading, axiosPublic);

    // Enhanced owner check function (same as AttendancePage)
    const isOwner = useCallback(() => {
        if (!classroom || !user) return false;

        // Check multiple possible owner/teacher fields
        const possibleOwnerFields = [
            classroom.owner,
            classroom.teacher,
            classroom.instructor,
            classroom.createdBy,
            classroom.teacherEmail
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

    // Debug classroom and user data
    useEffect(() => {
        if (classroom && user && process.env.NODE_ENV === 'development') {
            console.log('=== MATERIALS DEBUG INFO ===');
            console.log('Classroom data:', classroom);
            console.log('Current user:', user);
            console.log('Owner check result:', isOwner());
            console.log('============================');
        }
    }, [classroom, user, isOwner]);

    // Enhanced handle adding material with proper state update
    const handleAddMaterial = async (materialData) => {
        console.log('🔄 Adding material:', materialData);

        try {
            const result = await addMaterial(materialData);

            console.log('📥 Add material result:', result);

            if (result && (result.success || result.material)) {
                setShowAddMaterial(false);

                setTimeout(() => {
                    console.log('📊 Updated materials count:', materials?.length || 0);
                    console.log('📊 Materials by type:', (materials || []).map(m => ({ id: m.id, type: m.type, title: m.title })));
                }, 100);

                return result;
            } else {
                console.error('❌ Failed to add material:', result);
                return result;
            }
        } catch (error) {
            console.error('❌ Error adding material:', error);
            return { success: false, error: error.message };
        }
    };

    // Enhanced filtered materials and stats with safe array handling
    const filteredMaterials = React.useMemo(() => {
        const safeMaterials = materials || [];
        const filtered = filterMaterialsByType(safeMaterials, filterType);

        console.log('🔍 Filtered materials:', {
            totalMaterials: safeMaterials.length,
            filterType,
            filteredCount: filtered.length,
            materialTypes: safeMaterials.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1;
                return acc;
            }, {})
        });
        return filtered;
    }, [materials, filterType]);

    const materialStats = React.useMemo(() => {
        const safeMaterials = materials || [];
        const stats = calculateMaterialStats(safeMaterials);

        console.log('📊 Calculated stats:', stats);
        console.log('📊 Materials used for stats:', safeMaterials.map(m => ({ type: m.type, id: m.id })));
        return stats;
    }, [materials]);

    // Debug effect to track materials changes with safe handling
    React.useEffect(() => {
        const safeMaterials = materials || [];

        console.log('📈 Materials state updated:', {
            count: safeMaterials.length,
            types: safeMaterials.reduce((acc, m) => {
                acc[m.type] = (acc[m.type] || 0) + 1;
                return acc;
            }, {}),
            materials: safeMaterials.map(m => ({ id: m.id, type: m.type, title: m.title }))
        });
    }, [materials]);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Materials - {classroom?.name}</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate(`/classroom/${classroomId}`)}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                            >
                                <MdArrowBack className="mr-2" />
                                Back to Classroom
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            Materials - {classroom?.name}
                                        </h1>
                                        <p className="text-gray-600">
                                            {isOwner() ? 'Manage and share course materials' : 'Access course materials and resources'}
                                        </p>
                                        {/* Access level indicator */}
                                        <div className="mt-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isOwner()
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {isOwner() ? '👨‍🏫 Teacher Access' : '👨‍🎓 Student View'}
                                            </span>
                                            <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                📚 {materials?.length || 0} Materials Available
                                            </span>
                                        </div>
                                    </div>
                                    {isOwner() && (
                                        <button
                                            onClick={() => setShowAddMaterial(true)}
                                            className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-lg"
                                        >
                                            <MdAdd className="mr-2" />
                                            Add Material
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Debug Info (Remove in production) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm font-mono">
                                    Debug: Total Materials: {materials?.length || 0} |
                                    YouTube: {(materials || []).filter(m => m.type === 'youtube').length} |
                                    Files: {(materials || []).filter(m => m.type === 'file').length} |
                                    Links: {(materials || []).filter(m => m.type === 'link').length} |
                                    Role: {isOwner() ? 'Teacher' : 'Student'}
                                </p>
                            </div>
                        )}

                        {/* Stats and Filters */}
                        <MaterialStats
                            materialStats={materialStats}
                            filterType={filterType}
                            setFilterType={setFilterType}
                        />

                        {/* Materials Grid */}
                        <MaterialsGrid
                            materials={filteredMaterials}
                            onDelete={deleteMaterial}
                            onAddMaterial={() => setShowAddMaterial(true)}
                            isOwner={isOwner()} // Pass isOwner to control delete permissions
                        />
                    </div>
                </div>
            </div>

            {/* Add Material Modal - Only show if teacher */}
            {isOwner() && showAddMaterial && (
                <AddMaterialModal
                    onClose={() => setShowAddMaterial(false)}
                    onSubmit={handleAddMaterial}
                    classroomId={classroomId}
                />
            )}
        </div>
    );
};

export default MaterialsPage;
