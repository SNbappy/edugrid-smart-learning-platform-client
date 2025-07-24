import React, { useState } from 'react';
import { MdUpload } from 'react-icons/md';
import Swal from 'sweetalert2';
import { useFileUpload } from '../hooks/useFileUpload';
import { getFileTypeIcon, formatFileSize } from '../utils/fileHelpers';

const AddMaterialModal = ({ onClose, onSubmit, classroomId }) => {
    const [materialType, setMaterialType] = useState('file');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        file: null
    });

    const { isUploading, uploadProgress, uploadFile } = useFileUpload();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('📁 File selected:', {
                name: file.name,
                size: file.size,
                type: file.type,
                sizeMB: (file.size / (1024 * 1024)).toFixed(2)
            });

            setFormData({
                ...formData,
                file,
                title: formData.title || file.name.split('.').slice(0, -1).join('.')
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Title!',
                text: 'Please enter a title for the material.',
            });
            return;
        }

        let materialData = {
            title: formData.title,
            description: formData.description,
            type: materialType
        };

        if (materialType === 'file' && formData.file) {
            const uploadResult = await uploadFile(formData.file);

            if (!uploadResult.success) {
                return;
            }

            materialData = {
                ...materialData,
                ...uploadResult.data
            };
        } else if (materialType !== 'file') {
            if (!formData.url) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing URL!',
                    text: 'Please enter a valid URL.',
                });
                return;
            }
            materialData.url = formData.url;
        }

        onSubmit(materialData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Add Class Material</h2>

                <div className="mb-6">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setMaterialType('file')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${materialType === 'file'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            📁 File Upload
                        </button>
                        <button
                            onClick={() => setMaterialType('link')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${materialType === 'link'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🔗 Web Link
                        </button>
                        <button
                            onClick={() => setMaterialType('video')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${materialType === 'video'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🎥 Video
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Material title"
                            required
                            disabled={isUploading}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional description"
                            rows="3"
                            disabled={isUploading}
                        />
                    </div>

                    {materialType === 'file' ? (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload File * (PDF, Word, Excel, PowerPoint, Images, Videos - Max 10MB)
                            </label>

                            {isUploading ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-3"></div>
                                    <p className="text-gray-600 font-medium">Uploading to Cloudinary...</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                        <div
                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</p>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.mp3,.wav,.zip,.rar"
                                        required={!formData.file}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                            <MdUpload className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <span className="text-blue-500 hover:text-blue-600 font-medium">
                                            Click to upload or drag and drop
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            PDF, DOC, PPT, XLS, Images, Videos (Max 10MB)
                                        </span>
                                    </label>

                                    {formData.file && (
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-lg">{getFileTypeIcon(formData.file.type)}</span>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {formData.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(formData.file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                URL *
                            </label>
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={materialType === 'video' ? 'YouTube, Vimeo, or video URL' : 'Web link URL'}
                                required
                                disabled={isUploading}
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUploading}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Add Material'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMaterialModal;
