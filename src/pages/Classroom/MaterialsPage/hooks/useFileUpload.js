import { useState } from 'react';
import Swal from 'sweetalert2';
import { validateFile, uploadToCloudinary, getResourceType } from '../../../../services/uploadToCloudinary';
import { getFileCategory } from '../utils/fileHelpers';

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const uploadFile = async (file) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Validate file
            const validation = validateFile(file, 10);

            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            // Upload to Cloudinary
            const resourceType = getResourceType(file);
            const uploadResult = await uploadToCloudinary(file, resourceType);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (uploadResult.success) {
                const materialData = {
                    url: uploadResult.url,
                    fileName: uploadResult.originalFilename || file.name,
                    fileSize: uploadResult.bytes,
                    fileType: file.type,
                    category: getFileCategory(file.type),
                    publicId: uploadResult.publicId,
                    resourceType: uploadResult.resourceType,
                    fileFormat: uploadResult.format
                };

                return { success: true, data: materialData };
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: error.message,
            });
            return { success: false, error: error.message };
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return {
        isUploading,
        uploadProgress,
        uploadFile
    };
};
