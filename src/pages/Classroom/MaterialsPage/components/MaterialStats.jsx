import React from 'react';
import { MdFolder, MdInsertDriveFile, MdLink, MdVideoLibrary } from 'react-icons/md';

const MaterialStats = ({ materialStats, filterType, setFilterType }) => {
    return (
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
    );
};

export default MaterialStats;
