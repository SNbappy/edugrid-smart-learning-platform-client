// utils/materialHelpers.js

// Enhanced calculateMaterialStats function
export const calculateMaterialStats = (materials = []) => {
    // console.log('🔍 calculateMaterialStats input:', materials);

    // Always initialize with all required properties
    const stats = {
        videos: 0,  // ✅ Always initialize videos
        files: 0,
        links: 0,
        total: 0
    };

    // Handle case where materials is not an array
    if (!Array.isArray(materials)) {
        console.warn('⚠️ Materials is not an array:', materials);
        return stats;
    }

    materials.forEach((material, index) => {
        // console.log(`📊 Processing material ${index + 1}:`, {
        //     id: material.id,
        //     type: material.type,
        //     title: material.title
        // });

        const type = material.type?.toLowerCase();

        if (type === 'youtube') {
            stats.videos += 1;  // ✅ Count YouTube as videos
            // console.log('📹 Found YouTube video, videos count now:', stats.videos);
        } else if (type === 'file') {
            stats.files += 1;
        } else if (type === 'link') {
            stats.links += 1;
        }
        stats.total += 1;
    });

    // console.log('📊 Final stats:', stats);
    return stats;
};

// Enhanced filterMaterialsByType function
export const filterMaterialsByType = (materials = [], filterType) => {
    // console.log('🔍 filterMaterialsByType:', { materials: materials.length, filterType });

    if (!Array.isArray(materials)) {
        console.warn('⚠️ Materials is not an array for filtering:', materials);
        return [];
    }

    if (filterType === 'all') {
        return materials;
    }

    const filtered = materials.filter(material => {
        const type = material.type?.toLowerCase();

        // Map 'youtube' filter to 'youtube' type
        if (filterType === 'youtube') {
            return type === 'youtube';
        }

        return type === filterType;
    });

    // console.log('📋 Filtered results:', filtered.length, 'materials');
    return filtered;
};
