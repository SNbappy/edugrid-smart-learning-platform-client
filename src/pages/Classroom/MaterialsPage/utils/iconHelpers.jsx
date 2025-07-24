import React from 'react';
import {
    MdPictureAsPdf,
    MdDescription,
    MdSlideshow,
    MdTableChart,
    MdInsertDriveFile,
    MdLink,
    MdVideoLibrary,
    MdFolder
} from 'react-icons/md';

// Get React icon component based on file format
export const getTypeIcon = (material) => {
    if (material.fileFormat) {
        switch (material.fileFormat.toLowerCase()) {
            case 'pdf':
                return <MdPictureAsPdf className="text-red-500 text-2xl" />;
            case 'doc':
            case 'docx':
                return <MdDescription className="text-blue-500 text-2xl" />;
            case 'ppt':
            case 'pptx':
                return <MdSlideshow className="text-orange-500 text-2xl" />;
            case 'xls':
            case 'xlsx':
                return <MdTableChart className="text-green-500 text-2xl" />;
            default:
                return <MdInsertDriveFile className="text-gray-500 text-2xl" />;
        }
    }

    // Fallback based on type
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
