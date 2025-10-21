// Image upload service using ImgBB
export const uploadImageToImgBB = async (imageFile) => {
    try {
        // console.log('📤 Starting image upload to ImgBB...');

        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

        if (!apiKey) {
            throw new Error('ImgBB API key not found in environment variables');
        }

        // Create FormData for the API request
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('key', apiKey);

        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // console.log('✅ Image uploaded successfully:', result.data.url);
            return {
                success: true,
                url: result.data.url,
                deleteUrl: result.data.delete_url,
                displayUrl: result.data.display_url,
                thumb: result.data.thumb
            };
        } else {
            throw new Error(result.error?.message || 'Upload failed');
        }

    } catch (error) {
        console.error('❌ Image upload failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Validate image file before upload
export const validateImageFile = (file) => {
    const maxSize = 32 * 1024 * 1024; // 32MB (ImgBB limit)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
        return { valid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'File size must be less than 32MB' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
    }

    return { valid: true };
};

// Compress image before upload (optional)
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;

            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(resolve, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
    });
};
