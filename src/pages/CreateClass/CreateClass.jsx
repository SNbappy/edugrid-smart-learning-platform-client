import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import { uploadImageToImgBB, validateImageFile } from '../../services/imageUpload';


const CreateClass = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageError, setImageError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Handle image selection
    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            setImageError(validation.error);
            Swal.fire({
                icon: 'error',
                title: 'Invalid File!',
                text: validation.error,
            });
            return;
        }

        setSelectedFile(file);
        setImageError('');

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Upload image to ImgBB
    const uploadClassImage = async () => {
        if (!selectedFile) return '';

        setIsUploadingImage(true);
        try {
            console.log('📤 Uploading class image to ImgBB...');

            const uploadResult = await uploadImageToImgBB(selectedFile);

            if (uploadResult.success) {
                console.log('✅ Image uploaded successfully:', uploadResult.url);
                return uploadResult.url;
            } else {
                throw new Error(uploadResult.error);
            }
        } catch (error) {
            console.error('❌ Image upload failed:', error);
            return '';
        } finally {
            setIsUploadingImage(false);
        }
    };

    const onSubmit = async (data) => {
        // Check if image is selected
        if (!selectedFile) {
            setImageError('Class image is required');
            Swal.fire({
                icon: 'error',
                title: 'Image Required!',
                text: 'Please upload a class image before creating the classroom.',
            });
            return;
        }

        setIsLoading(true);
        console.log('📚 Creating class with data:', data);

        try {
            // Upload image (required)
            const imageUrl = await uploadClassImage();

            if (!imageUrl) {
                throw new Error('Failed to upload image');
            }

            const classroomData = {
                name: data.name,
                description: data.description,
                subject: data.subject,
                teacherEmail: user.email,
                teacherName: user.displayName || user.email.split('@')[0],
                imageUrl: imageUrl
            };

            const response = await axiosPublic.post('/classrooms', classroomData);

            console.log('✅ Class creation response:', response.data);

            if (response.data.success) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Class created successfully!",
                    text: `Class code: ${response.data.classroom.code}`,
                    showConfirmButton: false,
                    timer: 2000
                });

                setTimeout(() => {
                    navigate('/my-classes');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Error creating class:', error);
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed!',
                text: error.message || 'Failed to create class. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-poppins">
            <Helmet>
                <title>EduGrid | Create Class</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                {/* Main Content - Responsive */}
                <div className="flex-1 lg:ml-[320px] p-4 sm:p-6 lg:p-8">
                    <div className="max-w-2xl mx-auto">
                        {/* Header - Responsive */}
                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Create New Classroom</h1>
                            <p className="text-sm sm:text-base text-gray-600">Set up a new classroom for your students</p>
                        </div>

                        {/* Form Container - Responsive Padding */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
                                {/* Class Image Upload - Responsive */}
                                <div className="text-center mb-6 sm:mb-8">
                                    <div className="flex flex-col items-center">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                            Class Image *
                                        </label>
                                        <div className="relative mb-3 sm:mb-4">
                                            <div className={`w-28 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden border-2 bg-gray-50 flex items-center justify-center ${imageError ? 'border-red-300' : 'border-gray-200'
                                                }`}>
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Class Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-center px-2">
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-xs">Required</p>
                                                    </div>
                                                )}
                                            </div>

                                            {isUploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>

                                        <label className={`cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm ${selectedFile
                                                ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                                            }`}>
                                            {selectedFile ? 'Change Image' : 'Upload Image *'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={isUploadingImage}
                                                required
                                            />
                                        </label>

                                        {imageError && (
                                            <p className="text-red-500 text-xs sm:text-sm mt-2">{imageError}</p>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2 px-4 text-center">
                                            Upload an image that represents your classroom
                                        </p>
                                    </div>
                                </div>

                                {/* Class Name - Responsive */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        Class Name *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('name', { required: 'Class name is required' })}
                                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400"
                                        placeholder="e.g., Advanced Mathematics"
                                    />
                                    {errors.name && (
                                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.name.message}</span>
                                    )}
                                </div>

                                {/* Subject - Responsive */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('subject', { required: 'Subject is required' })}
                                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400"
                                        placeholder="e.g., Mathematics"
                                    />
                                    {errors.subject && (
                                        <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.subject.message}</span>
                                    )}
                                </div>

                                {/* Description - Responsive */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows="4"
                                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base text-gray-900 placeholder-gray-400 resize-none"
                                        placeholder="Brief description about the classroom..."
                                    />
                                </div>

                                {/* Action Buttons - Responsive */}
                                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/my-classes')}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || isUploadingImage || !selectedFile}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base font-medium"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                {isUploadingImage ? 'Uploading...' : 'Creating...'}
                                            </>
                                        ) : (
                                            'Create Classroom'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateClass;
