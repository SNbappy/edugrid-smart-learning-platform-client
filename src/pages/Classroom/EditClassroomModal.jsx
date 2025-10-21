import { useState, useRef } from 'react';
import { MdClose, MdImage, MdSave, MdDelete } from 'react-icons/md';
import { uploadImageToImgBB, validateImageFile, compressImage } from '../../services/imageUpload';

const EditClassroomModal = ({ classroom, onClose, onUpdate, axiosPublic }) => {
    const [formData, setFormData] = useState({
        title: classroom.name || '', // Map name to title for form
        subject: classroom.subject || '',
        description: classroom.description || '',
        image: classroom.imageUrl || ''
    });
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(classroom.imageUrl || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file using your existing validation
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setErrors(prev => ({
                ...prev,
                image: validation.error
            }));
            return;
        }

        setNewImage(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Clear error
        if (errors.image) {
            setErrors(prev => ({
                ...prev,
                image: ''
            }));
        }
    };

    // Remove image
    const removeImage = () => {
        setNewImage(null);
        setImagePreview('');
        setFormData(prev => ({
            ...prev,
            image: ''
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload image to ImgBB using your existing service
    const uploadImageToImgBBService = async () => {
        if (!newImage) return null;

        setIsUploadingImage(true);
        try {
            console.log('📤 Uploading classroom image to ImgBB...');

            // Compress image before upload using your existing service
            const compressedFile = await compressImage(newImage, 1200, 0.8);

            // Upload to ImgBB using your existing service
            const uploadResult = await uploadImageToImgBB(compressedFile);

            if (uploadResult.success) {
                console.log('✅ Classroom image uploaded successfully:', uploadResult.url);
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('❌ Classroom image upload failed:', error);
            setErrors(prev => ({
                ...prev,
                image: 'Failed to upload image. Please try again.'
            }));
            return null;
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Classroom title is required';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (formData.title.trim().length > 100) {
            newErrors.title = 'Title should be less than 100 characters';
        }

        if (formData.subject.trim().length > 50) {
            newErrors.subject = 'Subject should be less than 50 characters';
        }

        if (formData.description.trim().length > 500) {
            newErrors.description = 'Description should be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    // In EditClassroomModal.jsx - Update the handleSubmit function
    // In EditClassroomModal.jsx - Fix the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            let imageUrl = formData.image;

            // Upload new image if selected
            if (newImage) {
                const uploadedImageUrl = await uploadImageToImgBBService();
                if (uploadedImageUrl) {
                    imageUrl = uploadedImageUrl;
                } else {
                    return;
                }
            }

            // Update classroom data
            const updateData = {
                name: formData.title.trim(),
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                imageUrl: imageUrl
            };

            console.log('Sending update data:', updateData);

            const response = await axiosPublic.put(`/classrooms/${classroom._id}`, updateData);

            console.log('Full update response:', response.data);

            // *** IMPROVED ERROR HANDLING ***
            if (response.data.success) {
                if (response.data.classroom) {
                    // We have the updated classroom data
                    console.log('✅ Classroom updated with data:', response.data.classroom);
                    onUpdate(response.data.classroom);
                } else {
                    // Success but no classroom data - fetch it manually
                    console.log('✅ Update successful, fetching fresh data...');
                    try {
                        const fetchResponse = await axiosPublic.get(`/classrooms/${classroom._id}`);
                        if (fetchResponse.data.success) {
                            onUpdate(fetchResponse.data.classroom);
                        }
                    } catch (fetchError) {
                        console.error('Error fetching updated classroom:', fetchError);
                        // Still close the modal even if fetch fails
                    }
                }
            } else {
                throw new Error(response.data.message || 'Failed to update classroom');
            }

        } catch (error) {
            console.error('❌ Error updating classroom:', error);

            // Better error handling
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to update classroom';
                console.error('API Error:', error.response.data);
                setErrors({ submit: errorMessage });
            } else if (error.message) {
                setErrors({ submit: error.message });
            } else {
                setErrors({ submit: 'Network error. Please check your connection and try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm text-black">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Edit Classroom</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-1"
                        >
                            <MdClose className="text-2xl" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">
                            Classroom Image
                        </label>

                        <div className="relative">
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Classroom preview"
                                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                        title="Remove image"
                                    >
                                        <MdDelete className="text-lg" />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <MdImage className="text-4xl text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500">No image selected</p>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploadingImage}
                                className="mt-3 w-full bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <MdImage className="text-xl" />
                                {imagePreview ? 'Change Image' : 'Upload Image'}
                            </button>

                            {errors.image && (
                                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                            )}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                            Classroom Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter classroom title"
                            maxLength="100"
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">{errors.title}</p>
                        )}
                        <p className="text-gray-400 text-xs">
                            {formData.title.length}/100 characters
                        </p>
                    </div>

                    {/* Subject Input */}
                    <div className="space-y-2">
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter subject name"
                            maxLength="50"
                        />
                        {errors.subject && (
                            <p className="text-red-500 text-sm">{errors.subject}</p>
                        )}
                        <p className="text-gray-400 text-xs">
                            {formData.subject.length}/50 characters
                        </p>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter classroom description (optional)"
                            maxLength="500"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">{errors.description}</p>
                        )}
                        <p className="text-gray-400 text-xs">
                            {formData.description.length}/500 characters
                        </p>
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{errors.submit}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            disabled={isLoading || isUploadingImage}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isUploadingImage}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-lg hover:from-[#3a6b8a] hover:to-[#2d5a7a] transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading || isUploadingImage ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isUploadingImage ? 'Uploading...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <MdSave className="text-lg" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClassroomModal;
