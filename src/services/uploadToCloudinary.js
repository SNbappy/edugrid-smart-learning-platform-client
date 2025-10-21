// Validate file before upload
export const validateFile = (file, maxSizeMB = 10) => {
    // console.log('🔍 Validating file:', {
    //     name: file?.name,
    //     size: file?.size,
    //     type: file?.type,
    //     maxSizeMB: maxSizeMB
    // });

    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes

    const allowedTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        // Videos
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo',
        // Audio
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        // Archives
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ];

    if (!file) {
        // console.log('❌ Validation failed: No file selected');
        return { valid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
        // console.log('❌ Validation failed: File too large', {
        //     fileSize: file.size,
        //     maxSize: maxSize,
        //     fileSizeMB: (file.size / (1024 * 1024)).toFixed(2),
        //     maxSizeMB: maxSizeMB
        // });
        return {
            valid: false,
            error: `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        };
    }

    if (!allowedTypes.includes(file.type)) {
        // console.log('❌ Validation failed: File type not allowed', file.type);
        return {
            valid: false,
            error: `File type "${file.type}" not supported. Allowed: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, and Archives.`
        };
    }

    // console.log('✅ File validation passed');
    return { valid: true };
};

// Get Cloudinary resource type based on file type
export const getResourceType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'raw'; // For documents, audio, archives, etc.
};

// Upload to Cloudinary function
export const uploadToCloudinary = async (file, resourceType = 'auto') => {
    try {
        // console.log('📤 Starting Cloudinary upload:', {
        //     fileName: file.name,
        //     fileSize: file.size,
        //     fileType: file.type,
        //     resourceType: resourceType
        // });

        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            throw new Error('Cloudinary configuration missing. Please check your environment variables.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'edugrid/materials');

        // Set resource type
        if (resourceType && resourceType !== 'auto') {
            formData.append('resource_type', resourceType);
        }

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        // console.log('✅ Cloudinary upload successful:', {
        //     url: data.secure_url,
        //     publicId: data.public_id,
        //     resourceType: data.resource_type,
        //     format: data.format,
        //     bytes: data.bytes
        // });

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            resourceType: data.resource_type,
            format: data.format,
            bytes: data.bytes,
            originalFilename: data.original_filename,
            width: data.width,
            height: data.height
        };

    } catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
