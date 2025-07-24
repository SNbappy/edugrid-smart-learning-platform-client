import React from 'react';
import { MdDownload, MdDelete, MdVisibility, MdOpenInNew } from 'react-icons/md';
import { getTypeIcon } from '../utils/iconHelpers';
import { getTypeColor, handleFileDownload, formatFileSize } from '../utils/fileHelpers';

const MaterialCard = ({ material, onDelete }) => {
    // Different handlers for different material types
    const handleDownload = () => {
        if (material.type === 'file') {
            // For files: use download logic
            handleFileDownload(material);
        } else {
            // For links/videos: just open in new tab
            window.open(material.url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleView = () => {
        // Always open in new tab for viewing
        window.open(material.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header with icon and type */}
            <div className={`bg-gradient-to-r ${getTypeColor(material)} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    {getTypeIcon(material)}
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {material.fileFormat?.toUpperCase() || material.type?.toUpperCase() || 'FILE'}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {material.name || material.title}
                </h3>

                {material.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {material.description}
                    </p>
                )}

                <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Added {new Date(material.createdAt || material.uploadedAt).toLocaleDateString()}</span>
                    {material.fileSize && (
                        <>
                            <span className="mx-2">•</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                        </>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                        {material.type === 'file' ? (
                            <>
                                <MdDownload className="mr-1" />
                                Download
                            </>
                        ) : (
                            <>
                                <MdOpenInNew className="mr-1" />
                                Open Link
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleView}
                        className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Open in new tab"
                    >
                        <MdVisibility />
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

export default MaterialCard;
