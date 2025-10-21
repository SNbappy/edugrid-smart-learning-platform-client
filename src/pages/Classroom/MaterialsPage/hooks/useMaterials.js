import { useState, useEffect } from 'react';
import { convertYouTubeUrlToEmbed } from '../utils/youtubeUtils';
import { uploadFileToCloudinary } from '../utils/fileUpload';

export const useMaterials = (classroomId, user, loading, axiosPublic) => {
    const [classroom, setClassroom] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch materials
    useEffect(() => {
        const fetchMaterials = async () => {
            if (!classroomId || loading) return;

            try {
                setIsLoading(true);

                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);
                }

                const materialsResponse = await axiosPublic.get(`/classrooms/${classroomId}/materials`);
                if (materialsResponse.data.success) {
                    const allMaterials = [
                        ...(materialsResponse.data.materials.files || []),
                        ...(materialsResponse.data.materials.links || []),
                        ...(materialsResponse.data.materials.videos || [])
                    ];
                    setMaterials(allMaterials);
                }
            } catch (error) {
                console.error('❌ Error fetching materials:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMaterials();
    }, [classroomId, user, loading, axiosPublic]);

    // Add material function
    const addMaterial = async (materialData) => {
        try {
            // console.log('📤 Sending material data:', materialData);

            let requestData = {
                title: materialData.title,
                description: materialData.description || '',
                type: materialData.type
            };

            if (materialData.type === 'youtube') {
                // YouTube video
                const embedUrl = convertYouTubeUrlToEmbed(materialData.url);
                if (!embedUrl) {
                    return { success: false, error: 'Invalid YouTube URL' };
                }

                requestData.youtubeUrl = materialData.url;
                requestData.embedUrl = embedUrl;
            }
            else if (materialData.type === 'link') {
                // Web link
                requestData.url = materialData.url;
            }
            else if (materialData.type === 'file') {
                // File upload - upload to Cloudinary first
                // console.log('📁 Uploading file to Cloudinary...');
                const uploadResult = await uploadFileToCloudinary(materialData.file);

                if (!uploadResult.success) {
                    return { success: false, error: 'File upload failed: ' + uploadResult.error };
                }

                requestData.url = uploadResult.url;
                requestData.fileName = materialData.file.name;
                requestData.fileSize = materialData.file.size;
                requestData.fileType = materialData.file.type;
                requestData.publicId = uploadResult.publicId;
            }

            // console.log('📤 Final request data:', requestData);

            const response = await axiosPublic.post(`/classrooms/${classroomId}/materials`, requestData);

            if (response.data && response.data.success) {
                setMaterials(prev => [...prev, response.data.material]);
                return { success: true, material: response.data.material };
            } else {
                throw new Error(response.data?.message || 'Failed to add material');
            }

        } catch (error) {
            console.error('❌ Error adding material:', error);

            // Handle different error types
            let errorMessage = 'Failed to add material';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            return { success: false, error: errorMessage };
        }
    };

    // Delete material function
    const deleteMaterial = async (materialId, materialType = 'file') => {
        try {
            const response = await axiosPublic.delete(`/classrooms/${classroomId}/materials/${materialId}?type=${materialType}`);

            if (response.data && response.data.success) {
                setMaterials(prev => prev.filter(material => material.id !== materialId));
                return { success: true };
            }
            return { success: false, error: 'Delete failed' };
        } catch (error) {
            console.error('❌ Error deleting material:', error);
            return { success: false, error: error.message };
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