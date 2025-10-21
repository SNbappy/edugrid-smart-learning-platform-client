import React, { useContext, useState, useCallback, useMemo } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../../../hooks/useAxiosPublic';
import Sidebar from '../../Dashboard/Dashboard/Sidebar';
import {
    MdArrowBack,
    MdAdd,
    MdLibraryBooks,
    MdPeople,
    MdVideoLibrary,
    MdAttachFile,
    MdLink
} from 'react-icons/md';

// Import custom hooks and components
import { useMaterials } from './hooks/useMaterials';
import MaterialStats from './components/MaterialStats';
import MaterialsGrid from './components/MaterialsGrid';
import AddMaterialModal from './components/AddMaterialModal';

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

    // Enhanced owner check function
    const isOwner = useCallback(() => {
        if (!classroom || !user) return false;

        const possibleOwnerFields = [
            classroom.owner,
            classroom.teacher,
            classroom.instructor,
            classroom.createdBy,
            classroom.teacherEmail
        ];

        const isDirectOwner = possibleOwnerFields.some(field =>
            field && field.toLowerCase().trim() === user.email?.toLowerCase().trim()
        );

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

        const hasTeacherRole = classroom.members && Array.isArray(classroom.members) &&
            classroom.members.some(member => {
                const emailMatch = member.email?.toLowerCase().trim() === user.email?.toLowerCase().trim() ||
                    member.userId === user.uid;
                const teacherRoles = ['owner', 'teacher', 'instructor', 'admin'];
                return emailMatch && teacherRoles.includes(member.role?.toLowerCase());
            });

        return isDirectOwner || isInTeachersArray || isInInstructorsArray || hasTeacherRole;
    }, [classroom, user]);

    // Handle adding material with proper state update
    const handleAddMaterial = async (materialData) => {
        try {
            const result = await addMaterial(materialData);

            if (result && (result.success || result.material)) {
                setShowAddMaterial(false);
                return result;
            } else {
                return result;
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Updated material filtering and counting logic
    const filterMaterialsByType = useCallback((materials, filterType) => {
        if (!materials || !Array.isArray(materials)) return [];

        if (filterType === 'all') {
            return materials;
        }

        if (filterType === 'youtube' || filterType === 'video') {
            return materials.filter(material =>
                material.type === 'youtube' ||
                material.type === 'video' ||
                (material.url && material.url.includes('youtube.com')) ||
                (material.url && material.url.includes('youtu.be'))
            );
        }

        if (filterType === 'file' || filterType === 'files') {
            return materials.filter(material =>
                material.type === 'file' ||
                material.type === 'document' ||
                material.type === 'ppt' ||
                material.type === 'pdf' ||
                material.type === 'doc' ||
                material.type === 'docx' ||
                material.type === 'presentation' ||
                (material.fileName && /\.(pdf|doc|docx|ppt|pptx|txt|rtf|xls|xlsx)$/i.test(material.fileName)) ||
                (material.name && /\.(pdf|doc|docx|ppt|pptx|txt|rtf|xls|xlsx)$/i.test(material.name))
            );
        }

        if (filterType === 'link' || filterType === 'links') {
            return materials.filter(material =>
                material.type === 'link' ||
                (material.url &&
                    !material.url.includes('youtube.com') &&
                    !material.url.includes('youtu.be') &&
                    material.type !== 'file' &&
                    material.type !== 'document')
            );
        }

        return materials.filter(material => material.type === filterType);
    }, []);

    // Calculate material stats with corrected counting
    const calculateMaterialStats = useCallback((materials) => {
        if (!materials || !Array.isArray(materials)) {
            return { total: 0, youtube: 0, file: 0, link: 0 };
        }

        const stats = {
            total: materials.length,
            youtube: 0,
            file: 0,
            link: 0
        };

        materials.forEach(material => {
            if (material.type === 'youtube' ||
                material.type === 'video' ||
                (material.url && material.url.includes('youtube.com')) ||
                (material.url && material.url.includes('youtu.be'))) {
                stats.youtube++;
            }
            else if (material.type === 'file' ||
                material.type === 'document' ||
                material.type === 'ppt' ||
                material.type === 'pdf' ||
                material.type === 'doc' ||
                material.type === 'docx' ||
                material.type === 'presentation' ||
                (material.fileName && /\.(pdf|doc|docx|ppt|pptx|txt|rtf|xls|xlsx)$/i.test(material.fileName)) ||
                (material.name && /\.(pdf|doc|docx|ppt|pptx|txt|rtf|xls|xlsx)$/i.test(material.name))) {
                stats.file++;
            }
            else if (material.type === 'link' ||
                (material.url &&
                    !material.url.includes('youtube.com') &&
                    !material.url.includes('youtu.be') &&
                    material.type !== 'file' &&
                    material.type !== 'document')) {
                stats.link++;
            }
            else if (material.fileName || material.fileUrl || material.attachment) {
                stats.file++;
            }
            else if (material.url) {
                stats.link++;
            }
        });

        return stats;
    }, []);

    // Enhanced filtered materials and stats with safe array handling
    const filteredMaterials = useMemo(() => {
        const safeMaterials = materials || [];
        return filterMaterialsByType(safeMaterials, filterType);
    }, [materials, filterType, filterMaterialsByType]);

    const materialStats = useMemo(() => {
        const safeMaterials = materials || [];
        return calculateMaterialStats(safeMaterials);
    }, [materials, calculateMaterialStats]);

    if (loading || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="flex">
                    <Sidebar />
                    <div className="flex-1 lg:ml-[320px] flex items-center justify-center p-4">
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Materials</h3>
                            <p className="text-slate-600 text-sm sm:text-base px-4">Please wait while we fetch your classroom materials...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-black">
            <Helmet>
                <title>Materials - {classroom?.name} | EduGrid</title>
                <meta name="description" content={`Manage materials for ${classroom?.name} classroom`} />
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 lg:ml-[320px]">
                    {/* Responsive Header */}
                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 lg:z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Mobile Layout */}
                            <div className="lg:hidden py-3 space-y-3">
                                <button
                                    onClick={() => navigate(`/classroom/${classroomId}`)}
                                    className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
                                >
                                    <MdArrowBack className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">Back</span>
                                </button>

                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MdLibraryBooks className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-base font-bold text-slate-900 truncate">
                                            {classroom?.name}
                                        </h1>
                                        <p className="text-xs text-slate-500 truncate">Materials Library</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${isOwner()
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                        {isOwner() ? '👨‍🏫' : '👨‍🎓'}
                                    </span>

                                    <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                        <MdPeople className="w-3 h-3 mr-1" />
                                        <span className="font-medium">{classroom?.students?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden lg:flex items-center justify-between h-16">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={() => navigate(`/classroom/${classroomId}`)}
                                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200 group"
                                    >
                                        <MdArrowBack className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                        <span className="text-sm font-medium">Back to Classroom</span>
                                    </button>

                                    <div className="h-6 w-px bg-slate-300"></div>

                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <MdLibraryBooks className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-slate-900">
                                                {classroom?.name}
                                            </h1>
                                            <p className="text-xs text-slate-500 -mt-0.5">Materials Library</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isOwner()
                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {isOwner() ? '👨‍🏫 Teacher Access' : '👨‍🎓 Student View'}
                                        </span>

                                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                                            <MdPeople className="w-4 h-4 mr-2" />
                                            <span className="font-medium">{classroom?.students?.length || 0}</span>
                                            <span className="ml-1">students</span>
                                        </div>
                                    </div>

                                    {isOwner() && (
                                        <button
                                            onClick={() => setShowAddMaterial(true)}
                                            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-teal-600/25"
                                        >
                                            <MdAdd className="w-4 h-4 mr-2" />
                                            Add Material
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Responsive */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Mobile Add Material Button - Below Navbar */}
                        {isOwner() && (
                            <div className="lg:hidden mb-6">
                                <button
                                    onClick={() => setShowAddMaterial(true)}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-teal-600/25"
                                >
                                    <MdAdd className="w-5 h-5 mr-2" />
                                    Add New Material
                                </button>
                            </div>
                        )}

                        {/* Stats Grid - Responsive */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            {/* Total Materials Card */}
                            <div
                                className={`bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterType === 'all' ? 'border-teal-300 ring-2 ring-teal-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterType('all')}
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <MdLibraryBooks className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg sm:text-xl font-bold text-slate-900">
                                            {materialStats?.total || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Total</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            {/* Videos Card */}
                            <div
                                className={`bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterType === 'youtube' || filterType === 'video' ? 'border-purple-300 ring-2 ring-purple-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterType(filterType === 'youtube' || filterType === 'video' ? 'all' : 'youtube')}
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MdVideoLibrary className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg sm:text-xl font-bold text-slate-900">
                                            {materialStats?.youtube || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Videos</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${materialStats?.total ? (materialStats.youtube / materialStats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Files Card */}
                            <div
                                className={`bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterType === 'file' || filterType === 'files' ? 'border-emerald-300 ring-2 ring-emerald-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterType(filterType === 'file' || filterType === 'files' ? 'all' : 'file')}
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <MdAttachFile className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg sm:text-xl font-bold text-slate-900">
                                            {materialStats?.file || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Files</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${materialStats?.total ? (materialStats.file / materialStats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Links Card */}
                            <div
                                className={`bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition-all duration-300 cursor-pointer ${filterType === 'link' || filterType === 'links' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-slate-200'
                                    }`}
                                onClick={() => setFilterType(filterType === 'link' || filterType === 'links' ? 'all' : 'link')}
                            >
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MdLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg sm:text-xl font-bold text-slate-900">
                                            {materialStats?.link || 0}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">Links</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5">
                                    <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${materialStats?.total ? (materialStats.link / materialStats.total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Materials Section - Responsive */}
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                    <h2 className="text-base sm:text-lg font-semibold text-slate-900">Course Materials</h2>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                        {materials && materials.length > 0 && (
                                            <span className="text-xs sm:text-sm text-slate-600 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
                                                {filteredMaterials?.length || 0} material{filteredMaterials?.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                                            <label className="text-xs sm:text-sm text-slate-600">Filter:</label>
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="text-xs sm:text-sm border border-slate-300 rounded-lg px-2 sm:px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 flex-1 sm:flex-none"
                                            >
                                                <option value="all">All Materials</option>
                                                <option value="youtube">Videos</option>
                                                <option value="file">Files</option>
                                                <option value="link">Links</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <MaterialsGrid
                                    materials={filteredMaterials}
                                    onDelete={deleteMaterial}
                                    onAddMaterial={() => setShowAddMaterial(true)}
                                    isOwner={isOwner()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Material Modal */}
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
