// Calculate material statistics
export const calculateMaterialStats = (materials) => {
    const validMaterials = materials.filter(m => m != null);

    return {
        total: validMaterials.length,
        files: validMaterials.filter(m => m.type === 'file').length,
        links: validMaterials.filter(m => m.type === 'link').length,
        videos: validMaterials.filter(m => m.type === 'video').length
    };
};

// Filter materials by type
export const filterMaterialsByType = (materials, filterType) => {
    const validMaterials = materials.filter(material => material != null);

    if (filterType === 'all') {
        return validMaterials;
    }

    return validMaterials.filter(material => material.type === filterType);
};

// Sort materials by date
export const sortMaterialsByDate = (materials) => {
    return materials.sort((a, b) =>
        new Date(b.createdAt || b.uploadedAt || 0) - new Date(a.createdAt || a.uploadedAt || 0)
    );
};
