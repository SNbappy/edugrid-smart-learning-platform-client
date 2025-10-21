import React from 'react';
import { MdFolder, MdInsertDriveFile, MdLink, MdVideoLibrary } from 'react-icons/md';

const MaterialStats = ({ materialStats, filterType, setFilterType }) => {
    // Debug logging to track the materialStats props
    React.useEffect(() => {
        // console.log('📊 MaterialStats received props:', {
        //     materialStats,
        //     isUndefined: materialStats === undefined,
        //     isNull: materialStats === null,
        //     keys: materialStats ? Object.keys(materialStats) : 'N/A',
        //     videosValue: materialStats?.videos,
        //     videosType: typeof materialStats?.videos,
        //     filesValue: materialStats?.files,
        //     linksValue: materialStats?.links,
        //     totalValue: materialStats?.total
        // });
    }, [materialStats]);

    // Safe access to materialStats with comprehensive defaults
    const stats = React.useMemo(() => {
        if (!materialStats || typeof materialStats !== 'object') {
            console.warn('⚠️ MaterialStats: received invalid materialStats:', materialStats);
            return { total: 0, files: 0, links: 0, videos: 0 };
        }

        const safeStats = {
            total: materialStats.total || 0,
            files: materialStats.files || 0,
            links: materialStats.links || 0,
            videos: materialStats.videos || 0  // ✅ This should now work with the fixed calculateMaterialStats
        };

        // console.log('📋 MaterialStats using safe stats:', safeStats);
        return safeStats;
    }, [materialStats]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Total Materials */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MdFolder className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-gray-600">Total Materials</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                </div>
            </div>

            {/* Files */}
            <button
                onClick={() => setFilterType('file')}
                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'file'
                        ? 'bg-green-50 border-green-200 shadow-md'
                        : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                    }`}
            >
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <MdInsertDriveFile className="text-green-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Files</p>
                        <p className="text-xl font-bold text-gray-900">{stats.files}</p>
                    </div>
                </div>
            </button>

            {/* Links */}
            <button
                onClick={() => setFilterType('link')}
                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'link'
                        ? 'bg-purple-50 border-purple-200 shadow-md'
                        : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                    }`}
            >
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <MdLink className="text-purple-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Links</p>
                        <p className="text-xl font-bold text-gray-900">{stats.links}</p>
                    </div>
                </div>
            </button>

            {/* Videos - Fixed to show correct count */}
            <button
                onClick={() => setFilterType('youtube')} // ✅ Changed from 'video' to 'youtube'
                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'youtube' // ✅ Changed from 'video' to 'youtube'
                        ? 'bg-red-50 border-red-200 shadow-md'
                        : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                    }`}
            >
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <MdVideoLibrary className="text-red-600 text-xl" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Videos</p>
                        <p className="text-xl font-bold text-gray-900">
                            {stats.videos} {/* ✅ This will now show 1 instead of 0 */}
                        </p>
                        {/* Debug info - remove in production */}
                        {process.env.NODE_ENV === 'development' && (
                            <p className="text-xs text-red-500 mt-1">
                                Debug: {materialStats?.videos !== undefined ? materialStats.videos : 'undefined'}
                            </p>
                        )}
                    </div>
                </div>
            </button>

            {/* Show All */}
            <button
                onClick={() => setFilterType('all')}
                className={`text-left p-6 rounded-xl border transition-all ${filterType === 'all'
                        ? 'bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] border-[#457B9D] text-white shadow-md'
                        : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
                    }`}
            >
                <div className="text-center">
                    <p className={`text-sm ${filterType === 'all' ? 'text-white opacity-90' : 'text-gray-600'}`}>
                        Show All
                    </p>
                    <p className={`text-xl font-bold ${filterType === 'all' ? 'text-white' : 'text-blue-600'}`}>
                        View All
                    </p>
                </div>
            </button>
        </div>
    );
};

export default MaterialStats;
