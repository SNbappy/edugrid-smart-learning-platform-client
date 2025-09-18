import { useState } from 'react';
import Swal from 'sweetalert2';

const CreateTaskModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'assignment',
        dueDate: '',
        points: 100,
        instructions: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.dueDate) {
            Swal.fire({
                title: 'Validation Error',
                text: 'Please fill in all required fields (Title and Due Date).',
                icon: 'warning'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                placeholder="e.g., Chapter 5 Assignment"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Task Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                disabled={isSubmitting}
                            >
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                                <option value="homework">Homework</option>
                                <option value="exam">Exam</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Points
                            </label>
                            <input
                                type="number"
                                value={formData.points}
                                onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                min="1"
                                max="1000"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => handleChange('dueDate', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                required
                                disabled={isSubmitting}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                placeholder="Brief description of the task"
                                rows="3"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Instructions
                            </label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => handleChange('instructions', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-colors"
                                placeholder="Detailed instructions for students..."
                                rows="4"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-xl hover:from-[#3a6b8a] hover:to-[#457B9D] transition-all duration-300 font-semibold disabled:opacity-50 flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Task'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
