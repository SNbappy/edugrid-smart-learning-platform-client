import React from 'react';
import { MdAdd } from 'react-icons/md';
import MaterialCard from './MaterialCard';

const MaterialsGrid = ({ materials, onDelete, onAddMaterial }) => {
    if (materials.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <MdAdd className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Materials Yet</h3>
                <p className="text-gray-500 mb-6">
                    Upload your first learning material to get started.
                </p>
                <button
                    onClick={onAddMaterial}
                    className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                >
                    Add First Material
                </button>
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
                />
            ))}
        </div>
    );
};

export default MaterialsGrid;
