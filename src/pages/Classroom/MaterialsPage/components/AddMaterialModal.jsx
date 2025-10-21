import React, { useState } from 'react';
import { MdClose, MdVideoLibrary, MdLink, MdUploadFile, MdCloudUpload } from 'react-icons/md';
import { convertYouTubeUrlToEmbed } from '../utils/youtubeUtils';

const AddMaterialModal = ({ onClose, onSubmit, classroomId }) => {
    const [materialType, setMaterialType] = useState('youtube');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        file: null
    });
    const [dragActive, setDragActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    // Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        setError('');

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];

            // File size validation (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                setError('File size must be less than 10MB');
                return;
            }

            setFormData(prev => ({ ...prev, file }));
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError('');

            // File size validation (10MB limit)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                setError('File size must be less than 10MB');
                return;
            }

            setFormData(prev => ({ ...prev, file }));
        }
    };

    // Enhanced YouTube URL validation
    const isValidYouTubeUrl = (url) => {
        if (!url) return false;

        const patterns = [
            /^(?:https?:\/\/)?(?:m\.|www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:\S+)?$/,
            /^(?:https?:\/\/)?(?:m\.|www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\S+)?$/,
            /^(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\S+)?$/,
            /^(?:https?:\/\/)?(?:m\.|www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\S+)?$/
        ];

        return patterns.some(pattern => pattern.test(url.trim()));
    };

    // Enhanced URL validation for links
    const isValidUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    // Reset form data when switching material types
    const handleMaterialTypeChange = (newType) => {
        setMaterialType(newType);
        setError('');

        // Reset relevant form fields based on type
        if (newType === 'file') {
            setFormData(prev => ({ ...prev, url: '' }));
        } else {
            setFormData(prev => ({ ...prev, file: null }));
        }
    };

    // Handle form submission with enhanced error handling
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.title?.trim()) {
            setError('Please enter a title');
            return;
        }

        let submitData = {
            title: formData.title.trim(),
            description: formData.description?.trim() || '',
            type: materialType,
            classroomId
        };

        // Handle different material types with enhanced validation
        if (materialType === 'youtube') {
            if (!formData.url?.trim()) {
                setError('Please enter a YouTube URL');
                return;
            }

            const cleanUrl = formData.url.trim();

            if (!isValidYouTubeUrl(cleanUrl)) {
                setError('Please enter a valid YouTube URL (e.g., youtube.com/watch?v=ID or youtu.be/ID)');
                return;
            }

            try {
                const embedUrl = convertYouTubeUrlToEmbed(cleanUrl);
                if (!embedUrl) {
                    setError('Could not process the YouTube URL. Please check the format and try again.');
                    return;
                }

                // Extract video ID for additional validation
                const videoIdMatch = embedUrl.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
                if (!videoIdMatch || !videoIdMatch[1]) {
                    setError('Invalid YouTube video ID detected');
                    return;
                }

                submitData = {
                    ...submitData,
                    youtubeUrl: cleanUrl,
                    embedUrl: embedUrl,
                    url: cleanUrl,
                    videoId: videoIdMatch[1],
                    type: 'youtube'
                };

                console.log('🔍 YouTube URL Processing:', {
                    originalUrl: cleanUrl,
                    embedUrl: embedUrl,
                    videoId: videoIdMatch[1]
                });
            } catch (error) {
                console.error('YouTube URL processing error:', error);
                setError('Error processing YouTube URL. Please try again.');
                return;
            }
        }
        else if (materialType === 'link') {
            if (!formData.url?.trim()) {
                setError('Please enter a URL');
                return;
            }

            const cleanUrl = formData.url.trim();

            // Add protocol if missing
            let finalUrl = cleanUrl;
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                finalUrl = `https://${cleanUrl}`;
            }

            if (!isValidUrl(finalUrl)) {
                setError('Please enter a valid URL (e.g., https://example.com)');
                return;
            }

            submitData = {
                ...submitData,
                url: finalUrl,
                type: 'link'
            };
        }
        else if (materialType === 'file') {
            if (!formData.file) {
                setError('Please select a file');
                return;
            }

            // Enhanced file validation
            const file = formData.file;
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (file.size > maxSize) {
                setError('File size must be less than 10MB');
                return;
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
                'image/jpeg',
                'image/jpg',
                'image/png',
                'image/gif',
                'video/mp4',
                'video/webm',
                'video/ogg',
                'audio/mpeg',
                'audio/wav',
                'audio/ogg'
            ];

            if (!allowedTypes.includes(file.type)) {
                setError('Unsupported file type. Please upload PDF, DOC, PPT, image, video, or audio files.');
                return;
            }

            submitData = {
                ...submitData,
                file: file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                type: 'file'
            };
        }

        console.log('📤 Submitting material:', {
            ...submitData,
            file: submitData.file ? `${submitData.file.name} (${(submitData.file.size / 1024 / 1024).toFixed(2)}MB)` : undefined
        });

        setIsUploading(true);

        try {
            const result = await onSubmit(submitData);

            console.log('📥 Backend response:', result);

            if (result && (result.success || result.material)) {
                // Reset form and close modal on success
                setFormData({ title: '', description: '', url: '', file: null });
                setError('');
                onClose();
            } else {
                // Enhanced error handling
                let errorMessage = 'Failed to add material. Please try again.';

                if (result?.error) {
                    errorMessage = result.error;
                } else if (result?.message) {
                    errorMessage = result.message;
                } else if (typeof result === 'string') {
                    errorMessage = result;
                }

                console.error('❌ Backend error:', result);
                setError(errorMessage);
            }
        } catch (error) {
            console.error('❌ Submit error:', error);

            let errorMessage = 'An unexpected error occurred';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
            } else if (error.message?.includes('413')) {
                errorMessage = 'File too large. Please select a smaller file.';
            } else if (error.message?.includes('415')) {
                errorMessage = 'Unsupported file type. Please select a different file.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    // Format file size for display
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="fixed inset-0 z-50 p-4 overflow-y-auto text-black">
            {/* Glassmorphism Background with Blur */}
            <div
                className="fixed inset-0 bg-gradient-to-br from-blue-50/30 via-white/20 to-purple-50/30 backdrop-blur-lg"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="flex min-h-screen items-center justify-center">
                <div className="relative w-full max-w-lg">
                    {/* Glass Card Container */}
                    <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                        {/* Minimal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800">Add Material</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                                disabled={isUploading}
                            >
                                <MdClose size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Compact Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Compact Material Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Material Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleMaterialTypeChange('youtube')}
                                        disabled={isUploading}
                                        className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${materialType === 'youtube'
                                                ? 'border-red-400 bg-red-50 text-red-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <MdVideoLibrary size={20} className="mb-1" />
                                        <span className="text-xs font-medium">YouTube</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleMaterialTypeChange('file')}
                                        disabled={isUploading}
                                        className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${materialType === 'file'
                                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <MdUploadFile size={20} className="mb-1" />
                                        <span className="text-xs font-medium">File</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleMaterialTypeChange('link')}
                                        disabled={isUploading}
                                        className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${materialType === 'link'
                                                ? 'border-green-400 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                            } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <MdLink size={20} className="mb-1" />
                                        <span className="text-xs font-medium">Link</span>
                                    </button>
                                </div>
                            </div>

                            {/* Compact Dynamic Input Based on Type */}
                            {materialType === 'youtube' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        YouTube URL *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.url}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, url: e.target.value }));
                                            setError('');
                                        }}
                                        disabled={isUploading}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-200 disabled:opacity-50"
                                    />
                                </div>
                            )}

                            {materialType === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website URL *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.url}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, url: e.target.value }));
                                            setError('');
                                        }}
                                        disabled={isUploading}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 disabled:opacity-50"
                                    />
                                </div>
                            )}

                            {materialType === 'file' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Upload File *
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${dragActive
                                                ? 'border-blue-400 bg-blue-50/50'
                                                : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                                            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            if (!isUploading) setDragActive(true);
                                        }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isUploading}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm,.ogg,.mp3,.wav"
                                        />

                                        {!formData.file ? (
                                            <div>
                                                <MdCloudUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-600">
                                                    Drop file here or{' '}
                                                    <label
                                                        htmlFor="file-upload"
                                                        className={`text-blue-600 hover:text-blue-700 font-medium cursor-pointer`}
                                                    >
                                                        browse
                                                    </label>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PDF, DOC, Images, Videos (Max 10MB)</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-center text-green-600">
                                                    <MdUploadFile className="mr-2" size={18} />
                                                    <span className="text-sm font-medium">{formData.file.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500">{formatFileSize(formData.file.size)}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                                    disabled={isUploading}
                                                    className="text-red-600 hover:text-red-700 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Compact Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    disabled={isUploading}
                                    className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 disabled:opacity-50"
                                    placeholder="Enter title..."
                                    maxLength={100}
                                />
                            </div>

                            {/* Compact Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    disabled={isUploading}
                                    className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 disabled:opacity-50 resize-none"
                                    placeholder="Brief description..."
                                    maxLength={500}
                                />
                            </div>

                            {/* Compact Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-600 bg-white/70 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        !formData.title.trim() ||
                                        (materialType !== 'file' && !formData.url.trim()) ||
                                        (materialType === 'file' && !formData.file) ||
                                        isUploading
                                    }
                                    className={`px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm ${materialType === 'youtube' ? 'bg-red-500 hover:bg-red-600' :
                                            materialType === 'file' ? 'bg-blue-500 hover:bg-blue-600' :
                                                'bg-green-500 hover:bg-green-600'
                                        }`}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Adding...
                                        </div>
                                    ) : (
                                        'Add Material'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMaterialModal;
