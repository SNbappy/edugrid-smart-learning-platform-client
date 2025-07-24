import React, { useContext, useState } from 'react';
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
import AddMaterialModal from './components/AddMterialModal';
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
        materials,
        isLoading,
        addMaterial,
        deleteMaterial
    } = useMaterials(classroomId, user, loading, axiosPublic);

    // Handle adding material and closing modal
    const handleAddMaterial = async (materialData) => {
        const result = await addMaterial(materialData);
        if (result.success) {
            setShowAddMaterial(false);
        }
    };

    // Calculate filtered materials and stats
    const filteredMaterials = filterMaterialsByType(materials, filterType);
    const materialStats = calculateMaterialStats(materials);

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
                <title>{classroom?.name ? `EduGrid | Materials - ${classroom.name}` : 'EduGrid | Materials'}</title>
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
                                            Class Materials - {classroom?.name || 'Loading...'}
                                        </h1>
                                        <p className="text-gray-600">Share and manage course resources</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddMaterial(true)}
                                        className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-lg"
                                    >
                                        <MdAdd className="mr-2" />
                                        Add Material
                                    </button>
                                </div>
                            </div>
                        </div>

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
                        />
                    </div>
                </div>
            </div>

            {/* Add Material Modal */}
            {showAddMaterial && (
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
