// Format file size utility
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type icon (returns emoji string, not JSX)
export const getFileTypeIcon = (fileType) => {
    if (!fileType) return '📎';

    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
};

// Get file category
export const getFileCategory = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'document';
    if (fileType.includes('word') || fileType.includes('document')) return 'document';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'spreadsheet';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'presentation';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'archive';
    return 'other';
};

// Get type color gradient (returns string, not JSX)
export const getTypeColor = (material) => {
    if (material.fileFormat) {
        switch (material.fileFormat.toLowerCase()) {
            case 'pdf':
                return 'from-red-500 to-red-600';
            case 'doc':
            case 'docx':
                return 'from-blue-500 to-blue-600';
            case 'ppt':
            case 'pptx':
                return 'from-orange-500 to-orange-600';
            case 'xls':
            case 'xlsx':
                return 'from-green-500 to-green-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    }

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

// Handle file download
export const handleFileDownload = async (material) => {
    try {
        const response = await fetch(material.url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = material.fileName || 'download.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
    }
};
