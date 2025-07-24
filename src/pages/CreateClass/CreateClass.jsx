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

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Subject options
    const subjects = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
        'English', 'History', 'Geography', 'Economics', 'Psychology',
        'Art', 'Music', 'Physical Education', 'French', 'Spanish',
        'Philosophy', 'Literature', 'Social Studies', 'Environmental Science'
    ];

    // Grade options
    const grades = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
        'Grade 11', 'Grade 12', 'University Level', 'Graduate Level'
    ];

    // Handle image selection
    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File!',
                text: validation.error,
            });
            return;
        }

        setSelectedFile(file);

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
        setIsLoading(true);
        console.log('📚 Creating class with data:', data);

        try {
            let imageUrl = '';

            // Upload image if selected
            if (selectedFile) {
                imageUrl = await uploadClassImage();
            }

            const classroomData = {
                name: data.name,
                description: data.description,
                subject: data.subject,
                grade: data.grade,
                teacherEmail: user.email,
                teacherName: user.displayName || user.email.split('@')[0],
                maxStudents: parseInt(data.maxStudents) || 30,
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
                text: 'Failed to create class. Please try again.',
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
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Create Class</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Class</h1>
                                    <p className="text-lg text-gray-600">Set up your classroom and start teaching</p>
                                </div>
                                <div className="hidden md:flex items-center space-x-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Create Class Form */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Class Image Section */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="relative mb-6">
                                            <div className="w-40 h-32 rounded-xl overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
                                                {imagePreview ? (
                                                    <img
                                                        src={imagePreview}
                                                        alt="Class Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="text-gray-400 text-center">
                                                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-sm font-medium">Class Image</p>
                                                    </div>
                                                )}
                                            </div>

                                            {isUploadingImage && (
                                                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>

                                        <label className="cursor-pointer bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-colors font-medium">
                                            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                            {selectedFile ? 'Change Image' : 'Upload Class Image'}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                disabled={isUploadingImage}
                                            />
                                        </label>

                                        <p className="text-white/80 text-sm mt-3">
                                            Optional: Add an image to represent your class
                                        </p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="p-8">
                                    {/* Basic Information */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Basic Information
                                        </h3>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Class Name */}
                                            <div className="lg:col-span-2 space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Class Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register('name', { required: 'Class name is required' })}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="e.g., Advanced Mathematics, Physics 101"
                                                />
                                                {errors.name && (
                                                    <span className="text-red-500 text-sm font-medium flex items-center mt-2">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.name.message}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subject */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Subject *
                                                </label>
                                                <select
                                                    {...register('subject', { required: 'Please select a subject' })}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map((subject) => (
                                                        <option key={subject} value={subject}>
                                                            {subject}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.subject && (
                                                    <span className="text-red-500 text-sm font-medium flex items-center mt-2">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.subject.message}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Grade */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Grade Level
                                                </label>
                                                <select
                                                    {...register('grade')}
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                >
                                                    <option value="">Select Grade (Optional)</option>
                                                    {grades.map((grade) => (
                                                        <option key={grade} value={grade}>
                                                            {grade}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Max Students */}
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Maximum Students
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register('maxStudents')}
                                                    min="1"
                                                    max="100"
                                                    defaultValue="30"
                                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                                            <svg className="w-6 h-6 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                            </svg>
                                            Class Description
                                        </h3>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700">
                                                Description
                                            </label>
                                            <textarea
                                                {...register('description')}
                                                rows="5"
                                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white resize-none"
                                                placeholder="Describe what students will learn in this class, prerequisites, and any important information..."
                                            />
                                            <p className="text-xs text-gray-500">Help students understand what this class is about and what they can expect to learn.</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={isLoading || isUploadingImage}
                                            className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                    {isUploadingImage ? 'Uploading Image...' : 'Creating Class...'}
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Create Class
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={isLoading}
                                            className="flex-1 sm:flex-none px-8 py-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center justify-center disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Cancel
                                        </button>
                                    </div>
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
