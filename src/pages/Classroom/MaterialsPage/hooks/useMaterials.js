import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { sortMaterialsByDate } from '../utils/materialHelpers';

export const useMaterials = (classroomId, user, loading, axiosPublic) => {
    const [classroom, setClassroom] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch classroom and materials
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);

                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);

                    // Handle materials with nested structure
                    const materialsData = classroomResponse.data.classroom.materials || { files: [], links: [], videos: [] };

                    let allMaterials = [];

                    // If materials is already an array
                    if (Array.isArray(materialsData)) {
                        allMaterials = materialsData;
                    } else {
                        // If materials has nested structure
                        allMaterials = [
                            ...(materialsData.files || []).map(item => ({ ...item, type: 'file' })),
                            ...(materialsData.links || []).map(item => ({ ...item, type: 'link' })),
                            ...(materialsData.videos || []).map(item => ({ ...item, type: 'video' }))
                        ];
                    }

                    // Filter out null materials and sort
                    const validMaterials = allMaterials
                        .filter(material => material != null)
                        .map(material => ({
                            ...material,
                            id: material.id || material._id || Date.now().toString()
                        }));

                    const sortedMaterials = sortMaterialsByDate(validMaterials);

                    console.log('📋 Loaded materials:', sortedMaterials);
                    setMaterials(sortedMaterials);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Failed to load materials.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // Add new material with proper handling for different types
    const addMaterial = async (materialData) => {
        try {
            console.log('📚 Adding material to classroom:', materialData);

            // Prepare request data based on material type
            let requestData;

            if (materialData.type === 'link' || materialData.type === 'video') {
                // For web links and videos - use different field structure
                requestData = {
                    title: materialData.title,          // Use title field for links
                    description: materialData.description || '',
                    url: materialData.url,             // Direct URL field (not fileUrl)
                    type: materialData.type,           // Keep original type
                    category: materialData.type,       // Also send as category for backend compatibility
                    fileName: materialData.title,      // Use title as filename for links
                    fileType: 'text/html',            // Default type for web links
                    resourceType: 'link',             // Mark as link resource
                    uploadedBy: user.email
                };

                console.log('🔗 Prepared link/video data:', requestData);
            } else {
                // For files (existing logic) - use file-specific fields
                requestData = {
                    name: materialData.title,          // Backend expects 'name' for files
                    description: materialData.description || '',
                    fileUrl: materialData.url,         // Backend expects 'fileUrl' for files
                    fileName: materialData.fileName,
                    fileSize: materialData.fileSize,
                    fileType: materialData.fileType,
                    category: materialData.category || 'document',
                    publicId: materialData.publicId,
                    resourceType: materialData.resourceType || 'raw',
                    uploadedBy: user.email
                };

                console.log('📁 Prepared file data:', requestData);
            }

            console.log('📤 Sending request to backend with data:', requestData);

            const response = await axiosPublic.post(`/classrooms/${classroomId}/materials`, requestData);

            console.log('📥 Backend response:', response.data);

            if (response.data.success && response.data.material) {
                const newMaterial = {
                    ...response.data.material,
                    type: response.data.material.type || materialData.type,
                    createdAt: response.data.material.createdAt || new Date(),
                    id: response.data.material.id || Date.now().toString()
                };

                console.log('✅ Adding material to state:', newMaterial);
                setMaterials(prevMaterials => [newMaterial, ...prevMaterials]);

                Swal.fire('Success!', 'Material added successfully.', 'success');
                return { success: true };
            } else {
                console.error('❌ Invalid response from server:', response.data);
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('❌ Error adding material:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Show more specific error message
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add material';
            Swal.fire('Error!', errorMessage, 'error');

            return { success: false, error: error.message };
        }
    };

    // Delete material with enhanced type detection
    const deleteMaterial = async (materialId) => {
        const result = await Swal.fire({
            title: 'Delete Material?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                // Find the material to determine its type for proper deletion
                const materialToDelete = materials.find(m => m.id === materialId);
                const materialType = materialToDelete?.type || 'file';

                console.log('🗑️ Deleting material:', { materialId, materialType });

                // Use the correct type parameter for deletion
                await axiosPublic.delete(`/classrooms/${classroomId}/materials/${materialId}?type=${materialType}`);

                setMaterials(prevMaterials =>
                    prevMaterials.filter(material => material && material.id !== materialId)
                );

                Swal.fire('Deleted!', 'Material has been deleted.', 'success');
            } catch (error) {
                console.error('❌ Error deleting material:', error);

                // Still remove from local state even if backend fails
                setMaterials(prevMaterials =>
                    prevMaterials.filter(material => material && material.id !== materialId)
                );

                Swal.fire('Deleted!', 'Material has been deleted.', 'success');
            }
        }
    };

    return {
        classroom,
        materials,
        isLoading,
        addMaterial,
        deleteMaterial
    };
};
