import { Link } from 'react-router-dom';

const TasksHeader = ({ classroom, classroomId, userRole, canCreateTask, onCreateTask }) => {
    return (
        <div className="mb-6">
            {/* Back button */}
            <Link
                to={`/classroom/${classroomId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Classroom
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tasks & Assignments - {classroom?.name}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {userRole === 'teacher'
                            ? 'Manage and review student assignments'
                            : 'View and submit your assignments'
                        }
                    </p>

                    {/* Role indicator badge */}
                    <div className="mt-3 flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${userRole === 'teacher'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                            {userRole === 'teacher' ? '👨‍🏫 Teacher View' : '👨‍🎓 Student View'}
                        </span>

                        {/* Debug permission indicator (remove after fixing) */}
                        {process.env.NODE_ENV === 'development' && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${canCreateTask
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {canCreateTask ? '✅ Can Create' : '❌ Cannot Create'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Create task button - only show if user has permission */}
                {canCreateTask && (
                    <button
                        onClick={onCreateTask}
                        className="bg-gradient-to-r from-[#457B9D] to-[#3a6b8a] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Task
                    </button>
                )}

                {/* Debug: Show why button is hidden (remove after fixing) */}
                {!canCreateTask && process.env.NODE_ENV === 'development' && (
                    <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                        <div>❌ Create Task button hidden</div>
                        <div>Role: {userRole}</div>
                        <div>Permission: {canCreateTask ? 'Yes' : 'No'}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TasksHeader;
