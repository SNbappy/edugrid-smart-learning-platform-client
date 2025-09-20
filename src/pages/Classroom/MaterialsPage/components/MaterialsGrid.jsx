import React from 'react';
import MaterialCard from './MaterialCard';
import { MdAdd } from 'react-icons/md';

const MaterialsGrid = ({ materials, onDelete, onAddMaterial, isOwner = false }) => {
    if (!materials || materials.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl text-gray-300 mb-4">📚</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Materials Yet</h3>
                <p className="text-gray-500 mb-6">
                    {isOwner
                        ? 'Start building your course library by adding your first material.'
                        : 'No course materials have been shared yet.'
                    }
                </p>
                {isOwner && (
                    <button
                        onClick={onAddMaterial}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold mx-auto"
                    >
                        <MdAdd className="mr-2" />
                        Add First Material
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
                <MaterialCard
                    key={material.id}
                    material={material}
                    onDelete={onDelete}
                    isOwner={isOwner}  // ✅ IMPORTANT: Pass isOwner prop to each MaterialCard
                />
            ))}
        </div>
    );
};

export default MaterialsGrid;
