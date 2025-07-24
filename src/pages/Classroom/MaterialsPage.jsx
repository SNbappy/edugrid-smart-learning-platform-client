import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import Sidebar from '../Dashboard/Dashboard/Sidebar';
import { uploadImageToImgBB, validateImageFile } from '../../services/imageUpload';
import {
    MdArrowBack,
    MdAdd,
    MdFolder,
    MdInsertDriveFile,
    MdLink,
    MdVideoLibrary,
    MdDownload,
    MdDelete,
    MdVisibility,
    MdEdit,
    MdUpload
} from 'react-icons/md';

const MaterialsPage = () => {
    const { user, loading } = useContext(AuthContext);
    const { classroomId } = useParams();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const [classroom, setClassroom] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [filterType, setFilterType] = useState('all');

    // Fetch classroom and materials
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const classroomResponse = await axiosPublic.get(`/classrooms/${classroomId}`);
                if (classroomResponse.data.success) {
                    setClassroom(classroomResponse.data.classroom);

                    // Combine all materials
                    const allMaterials = [
                        ...(classroomResponse.data.classroom.materials?.files || []).map(item => ({ ...item, type: 'file' })),
                        ...(classroomResponse.data.classroom.materials?.links || []).map(item => ({ ...item, type: 'link' })),
                        ...(classroomResponse.data.classroom.materials?.videos || []).map(item => ({ ...item, type: 'video' }))
                    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setMaterials(allMaterials);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Swal.fire('Error!', 'Failed to load materials.', 'error');
                navigate(`/classroom/${classroomId}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!loading && user && classroomId) {
            fetchData();
        }
    }, [classroomId, user, loading, axiosPublic, navigate]);

    // Add new material
    const addMaterial = async (materialData) => {
        try {
            const newMaterial = {
                id: Date.now().toString(),
                ...materialData,
                createdAt: new Date(),
                createdBy: user.email,
                downloads: 0,
                views: 0
            };

            setMaterials([newMaterial, ...materials]);
            setShowAddMaterial(false);

            Swal.fire('Success!', 'Material added successfully.', 'success');
        } catch (error) {
            console.error('Error adding material:', error);
            Swal.fire('Error!', 'Failed to add material.', 'error');
        }
    };

    // Delete material
    const deleteMaterial = async (materialId) => {
        const result = await Swal.fire({
            title: 'Delete Material?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            setMaterials(materials.filter(material => material.id !== materialId));
            Swal.fire('Deleted!', 'Material has been deleted.', 'success');
        }
    };

    // Filter materials
    const filteredMaterials = filterType === 'all'
        ? materials
        : materials.filter(material => material.type === filterType);

    const materialStats = {
        total: materials.length,
        files: materials.filter(m => m.type === 'file').length,
        links: materials.filter(m => m.type === 'link').length,
        videos: materials.filter(m => m.type === 'video').length
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#457B9D] mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] font-poppins">
            <Helmet>
                <title>EduGrid | Materials - {classroom?.name}</title>
            </Helmet>

            <div className="flex">
                <Sidebar />

                <div className="flex-1 ml-[320px] p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate(`/classroom/${classroomId}`)}
                                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
                            >
                                <MdArrowBack className="mr-2" />
                                Back to Classroom
                            </button>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            Class Materials - {classroom?.name}
                                        </h1>
                                        <p className="text-gray-600">Share and manage course resources</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddMaterial(true)}
                                        className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-lg"
                                    >
                                        <MdAdd className="mr-2" />
                                        Add Material
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats and Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MdFolder className="text-blue-600 text-xl" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-600">Total Materials</p>
                                        <p className="text-2xl font-bold text-gray-900">{materialStats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setFilterType('file')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'file'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <MdInsertDriveFile className="text-green-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Files</p>
                                        <p className="text-xl font-bold text-gray-900">{materialStats.files}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterType('link')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'link'
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <MdLink className="text-purple-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Links</p>
                                        <p className="text-xl font-bold text-gray-900">{materialStats.links}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterType('video')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'video'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <MdVideoLibrary className="text-red-600 text-xl mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">Videos</p>
                                        <p className="text-xl font-bold text-gray-900">{materialStats.videos}</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setFilterType('all')}
                                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'all'
                                        ? 'bg-blue-50 border-blue-200'
                                        : 'bg-white border-gray-100 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-center">
                                    <p className="text-sm text-gray-600">Show All</p>
                                    <p className="text-xl font-bold text-blue-600">View All</p>
                                </div>
                            </button>
                        </div>

                        {/* Materials Grid */}
                        {filteredMaterials.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                <MdFolder className="text-6xl text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Materials Yet</h3>
                                <p className="text-gray-500 mb-6">Start sharing resources with your students.</p>
                                <button
                                    onClick={() => setShowAddMaterial(true)}
                                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                                >
                                    Add First Material
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMaterials.map((material) => (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        onDelete={deleteMaterial}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Material Modal */}
            {showAddMaterial && (
                <AddMaterialModal
                    onClose={() => setShowAddMaterial(false)}
                    onSubmit={addMaterial}
                />
            )}
        </div>
    );
};

// Material Card Component
const MaterialCard = ({ material, onDelete }) => {
    const getTypeIcon = () => {
        switch (material.type) {
            case 'file':
                return <MdInsertDriveFile className="text-green-500 text-2xl" />;
            case 'link':
                return <MdLink className="text-purple-500 text-2xl" />;
            case 'video':
                return <MdVideoLibrary className="text-red-500 text-2xl" />;
            default:
                return <MdFolder className="text-blue-500 text-2xl" />;
        }
    };

    const getTypeColor = () => {
        switch (material.type) {
            case 'file':
                return 'from-green-500 to-green-600';
            case 'link':
                return 'from-purple-500 to-purple-600';
            case 'video':
                return 'from-red-500 to-red-600';
            default:
                return 'from-blue-500 to-blue-600';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className={`bg-gradient-to-r ${getTypeColor()} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    {getTypeIcon()}
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {material.type.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {material.title}
                </h3>

                {material.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {material.description}
                    </p>
                )}

                <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Added {new Date(material.createdAt).toLocaleDateString()}</span>
                    {material.size && (
                        <>
                            <span className="mx-2">•</span>
                            <span>{material.size}</span>
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center">
                        <MdVisibility className="mr-1" />
                        View
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                        <MdDownload />
                    </button>
                    <button
                        onClick={() => onDelete(material.id)}
                        className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        <MdDelete />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add Material Modal
const AddMaterialModal = ({ onClose, onSubmit }) => {
    const [materialType, setMaterialType] = useState('file');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        file: null
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title) return;

        let materialData = {
            title: formData.title,
            description: formData.description,
            type: materialType
        };

        if (materialType === 'file' && formData.file) {
            setIsUploading(true);
            try {
                // Upload file to ImgBB (you can modify this for other file types)
                const uploadResult = await uploadImageToImgBB(formData.file);
                if (uploadResult.success) {
                    materialData.url = uploadResult.url;
                    materialData.size = (formData.file.size / 1024 / 1024).toFixed(2) + ' MB';
                    materialData.fileName = formData.file.name;
                }
            } catch (error) {
                console.error('Upload error:', error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        } else if (materialType !== 'file') {
            materialData.url = formData.url;
        }

        onSubmit(materialData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
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
                            File
                        </button>
                        <button
                            onClick={() => setMaterialType('link')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${materialType === 'link'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Link
                        </button>
                        <button
                            onClick={() => setMaterialType('video')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${materialType === 'video'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Video
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
                        />
                    </div>

                    {materialType === 'file' ? (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Upload File *
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                <MdUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept="*/*"
                                    required
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    Click to upload or drag and drop
                                </label>
                                {formData.file && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected: {formData.file.name}
                                    </p>
                                )}
                            </div>
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
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
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

export default MaterialsPage;
