import { MdAssignment } from 'react-icons/md';

const EmptyState = ({ filterStatus, userRole, onCreateTask }) => {
    const getEmptyStateContent = () => {
        if (filterStatus === 'all') {
            return {
                title: 'No Tasks Yet',
                message: userRole === 'teacher'
                    ? 'Create your first assignment to get started.'
                    : 'No assignments have been created yet.',
                showButton: userRole === 'teacher'
            };
        }

        return {
            title: `No ${filterStatus} Tasks`,
            message: `No tasks match the ${filterStatus} filter.`,
            showButton: false
        };
    };

    const content = getEmptyStateContent();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <MdAssignment className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {content.title}
            </h3>
            <p className="text-gray-500 mb-6">
                {content.message}
            </p>
            {content.showButton && (
                <button
                    onClick={onCreateTask}
                    className="px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white rounded-xl hover:from-[#3a6b8a] hover:to-[#457B9D] transition-all duration-300 font-semibold shadow-lg"
                >
                    Create First Task
                </button>
            )}
        </div>
    );
};

export default EmptyState;
