// Updated fileUpload.js for Vite
export const uploadFileToCloudinary = async (file) => {
    try {
        // Use import.meta.env instead of process.env for Vite
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        // console.log('🌤️ Cloud Name:', cloudName);
        // console.log('🎯 Upload Preset:', uploadPreset);

        // Check if environment variables are set
        if (!cloudName) {
            throw new Error('VITE_CLOUDINARY_CLOUD_NAME environment variable is not set');
        }

        if (!uploadPreset) {
            throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET environment variable is not set');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
        // console.log('📤 Uploading to:', uploadUrl);

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        // console.log('✅ Upload successful:', data.secure_url);

        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id
        };
    } catch (error) {
        console.error('❌ Upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
