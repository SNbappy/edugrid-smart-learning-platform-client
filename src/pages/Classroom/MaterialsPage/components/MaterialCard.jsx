import React, { useState } from 'react';
import { MdVideoLibrary, MdImage, MdDescription, MdLink, MdDelete, MdOpenInNew, MdDownload } from 'react-icons/md';

const MaterialCard = ({ material, onDelete, isOwner = false }) => {
    const [imageError, setImageError] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Enhanced download function that forces download
    const handleDownload = async (fileUrl, fileName) => {
        if (isDownloading) return;

        setIsDownloading(true);

        try {
            // For Cloudinary URLs, add the download flag
            let downloadUrl = fileUrl;
            if (fileUrl.includes('cloudinary.com')) {
                downloadUrl = fileUrl.includes('?')
                    ? `${fileUrl}&fl_attachment=true`
                    : `${fileUrl}?fl_attachment=true`;
            }

            // Fetch the file as blob to force download
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // Create and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'download';
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: try original method
            try {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileName || 'download';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (fallbackError) {
                console.error('Fallback download failed:', fallbackError);
                // Last resort: open in new tab
                window.open(fileUrl, '_blank');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    // Get appropriate icon based on material type
    const getFileIcon = (type, fileType = '') => {
        if (type === 'youtube') return <MdVideoLibrary className="text-red-500" size={20} />;
        if (type === 'link') return <MdLink className="text-blue-500" size={20} />;
        if (type === 'file') {
            if (fileType?.startsWith('image/')) return <MdImage className="text-green-500" size={20} />;
            return <MdDescription className="text-purple-500" size={20} />;
        }
        return <MdDescription className="text-gray-500" size={20} />;
    };

    // Get material type label
    const getTypeLabel = (type, fileType = '') => {
        if (type === 'youtube') return 'YouTube Video';
        if (type === 'link') return 'Web Link';
        if (type === 'file') {
            if (fileType?.startsWith('image/')) return 'Image';
            if (fileType === 'application/pdf') return 'PDF Document';
            if (fileType?.startsWith('video/')) return 'Video File';
            if (fileType?.startsWith('audio/')) return 'Audio File';
            return 'Document';
        }
        return 'Material';
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Extract filename from URL or use provided filename
    const getDisplayFileName = () => {
        if (material.fileName) return material.fileName;
        if (material.url) {
            const urlParts = material.url.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            const fileName = lastPart.split('?')[0]; // Remove query parameters
            return fileName || material.title;
        }
        return material.title;
    };

    // Enhanced YouTube video ID extraction with comprehensive regex patterns
    const getYouTubeVideoId = (url) => {
        if (!url) return null;

        // Comprehensive regex patterns for different YouTube URL formats
        const patterns = [
            // Standard watch URLs with various parameters
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
            // Alternative comprehensive pattern
            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/,
            // More specific pattern for edge cases
            /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            // Direct video ID extraction from various formats
            /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/,
            // Handle URLs with additional parameters
            /youtube\.com\/watch\?(?=.*v=([^&\n?#]+)).*$/,
            // Handle youtu.be short URLs
            /youtu\.be\/([^&\n?#]+)/,
            // Handle embed URLs
            /youtube\.com\/embed\/([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                // Try different capture groups
                const videoId = match[1] || match[7] || match[2];
                if (videoId && videoId.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                    console.log('✅ YouTube Video ID extracted:', videoId, 'from URL:', url);
                    return videoId;
                }
            }
        }

        console.warn('❌ Could not extract YouTube video ID from URL:', url);
        return null;
    };

    // Direct YouTube embed component - replaces SimpleYouTubeEmbed
    const YouTubeEmbed = ({ videoId }) => {
        if (!videoId) return null;

        return (
            <div className="relative w-full h-full overflow-hidden rounded-lg bg-black">
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
        );
    };

    // Simple LinkPreview fallback component
    const LinkPreviewFallback = ({ url }) => (
        <div className="h-48 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] rounded-lg flex flex-col items-center justify-center text-white">
            <MdLink className="text-4xl mb-2" />
            <p className="font-medium">Web Link</p>
            <p className="text-sm text-center px-4 truncate max-w-full opacity-90">
                {url}
            </p>
        </div>
    );

    // Render preview based on material type
    const renderPreview = () => {
        if (material.type === 'youtube') {
            const videoId = getYouTubeVideoId(material.youtubeUrl || material.url || material.embedUrl);

            console.log('🔍 YouTube Debug Info:', {
                materialType: material.type,
                youtubeUrl: material.youtubeUrl,
                url: material.url,
                embedUrl: material.embedUrl,
                extractedVideoId: videoId,
                title: material.title
            });

            if (videoId) {
                return (
                    <div className="mb-4 h-48 rounded-lg overflow-hidden">
                        <YouTubeEmbed videoId={videoId} />
                    </div>
                );
            }

            // Fallback for YouTube when video ID extraction fails
            return (
                <div className="mb-4 h-48 bg-red-50 rounded-lg flex flex-col items-center justify-center border border-red-200">
                    <MdVideoLibrary className="text-red-500 text-4xl mb-2" />
                    <p className="text-red-700 font-medium">YouTube Video</p>
                    <p className="text-red-600 text-sm text-center px-4 truncate max-w-full">
                        {material.title}
                    </p>
                    <p className="text-red-500 text-xs mt-1">
                        Video preview unavailable
                    </p>
                </div>
            );
        }

        if (material.type === 'link') {
            return (
                <div className="mb-4 h-48 rounded-lg overflow-hidden">
                    <LinkPreviewFallback url={material.url} />
                </div>
            );
        }

        if (material.type === 'file') {
            // Handle images
            if (material.fileType?.startsWith('image/') && !imageError) {
                return (
                    <div className="mb-4">
                        <img
                            src={material.url}
                            alt={material.title}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={() => setImageError(true)}
                        />
                    </div>
                );
            }

            // Handle PDFs - Show actual PDF preview
            if (material.fileType === 'application/pdf') {
                return (
                    <div className="mb-4 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={`${material.url}#view=FitH&toolbar=0&navpanes=0`}
                            className="w-full h-full border-0"
                            title={material.title}
                            loading="lazy"
                        />
                    </div>
                );
            }

            // Handle video files
            if (material.fileType?.startsWith('video/')) {
                return (
                    <div className="mb-4 h-48 bg-black rounded-lg overflow-hidden">
                        <video
                            src={material.url}
                            className="w-full h-full object-contain"
                            controls
                            preload="metadata"
                        />
                    </div>
                );
            }

            // Handle audio files
            if (material.fileType?.startsWith('audio/')) {
                return (
                    <div className="mb-4 h-48 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex flex-col items-center justify-center border border-purple-200">
                        <MdDescription className="text-purple-500 text-4xl mb-2" />
                        <p className="text-purple-700 font-medium text-center px-2 break-words">
                            {getDisplayFileName()}
                        </p>
                        <audio
                            src={material.url}
                            controls
                            className="mt-2 w-3/4"
                        />
                        <p className="text-purple-500 text-sm mt-1">
                            {formatFileSize(material.fileSize)}
                        </p>
                    </div>
                );
            }

            // Handle other files - Show actual filename
            const displayName = getDisplayFileName();
            return (
                <div className="mb-4 h-48 bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                    <MdDescription className="text-purple-500 text-4xl mb-2" />
                    <p className="text-gray-700 font-medium text-center px-2 break-words">
                        {displayName}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        {getTypeLabel(material.type, material.fileType)} • {formatFileSize(material.fileSize)}
                    </p>
                </div>
            );
        }

        // Default fallback
        return (
            <div className="mb-4 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No preview available</p>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
                {/* Dynamic Preview */}
                {renderPreview()}

                {/* Content */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                            {material.title}
                        </h3>
                        <div className="ml-2">
                            {getFileIcon(material.type, material.fileType)}
                        </div>
                    </div>

                    {material.description && (
                        <p className="text-gray-600 text-sm line-clamp-3">
                            {material.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{getTypeLabel(material.type, material.fileType)}</span>
                        <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center mt-4 pt-4 border-t border-gray-100 ${isOwner ? 'justify-between' : 'justify-start'
                    }`}>
                    <div className="flex items-center space-x-2">
                        {material.type === 'youtube' ? (
                            <button
                                onClick={() => window.open(material.youtubeUrl || material.url, '_blank')}
                                className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                            >
                                <MdOpenInNew size={16} className="mr-1" />
                                Watch on YouTube
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => window.open(material.url, '_blank')}
                                    className="flex items-center px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                >
                                    <MdOpenInNew size={16} className="mr-1" />
                                    {material.type === 'link' ? 'Visit' : 'View'}
                                </button>

                                {material.type === 'file' && (
                                    <button
                                        onClick={() => handleDownload(material.url, getDisplayFileName())}
                                        disabled={isDownloading}
                                        className={`flex items-center px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <MdDownload size={16} className="mr-1" />
                                        {isDownloading ? 'Downloading...' : 'Download'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Conditional Delete Button - Only show for teachers/owners */}
                    {isOwner && (
                        <button
                            onClick={() => onDelete(material.id)}
                            className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                            <MdDelete size={16} className="mr-1" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialCard;
