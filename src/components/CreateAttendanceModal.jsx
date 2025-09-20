import { useState } from 'react';
import { MdClose, MdCalendarToday, MdTitle, MdDescription, MdAdd } from 'react-icons/md';

const CreateAttendanceModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation - Description is now optional
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.date) newErrors.date = 'Date is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error creating session:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 animate-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MdAdd className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Create Attendance Session</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Track student attendance for this session</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors duration-200 text-slate-400 hover:text-slate-600"
                    >
                        <MdClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Session Title
                        </label>
                        <div className="relative">
                            <MdTitle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.title
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-slate-300 hover:border-slate-400 focus:border-blue-500'
                                    }`}
                                placeholder="e.g., Week 5 Lecture"
                            />
                        </div>
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Description Field - Now Optional */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                            <span className="text-slate-400 text-xs ml-1">(optional)</span>
                        </label>
                        <div className="relative">
                            <MdDescription className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full pl-11 pr-4 py-3 border border-slate-300 hover:border-slate-400 focus:border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Describe what this session covers... (optional)"
                            />
                        </div>
                    </div>

                    {/* Date Field */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Session Date
                        </label>
                        <div className="relative">
                            <MdCalendarToday className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.date
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-slate-300 hover:border-slate-400 focus:border-blue-500'
                                    }`}
                            />
                        </div>
                        {errors.date && (
                            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-all duration-200 flex items-center space-x-2 min-w-[120px] justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <MdAdd className="w-4 h-4" />
                                <span>Create Session</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateAttendanceModal;
