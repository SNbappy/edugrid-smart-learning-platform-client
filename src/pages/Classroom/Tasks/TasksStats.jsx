import {
    MdAssignment,
    MdCheckCircle,
    MdPending,
    MdWarning,
} from 'react-icons/md';

const TasksStats = ({ taskStats, filterStatus, setFilterStatus, userRole, tasks, userEmail }) => {
    const submittedTasksCount = tasks.filter(task =>
        task.submissions?.some(sub => sub.studentEmail === userEmail)
    ).length;

    const statsConfig = [
        {
            key: 'all',
            label: 'Total Tasks',
            value: taskStats.total,
            icon: MdAssignment,
            colors: 'bg-blue-100 text-blue-600',
            activeColors: 'bg-blue-50 border-blue-200'
        },
        {
            key: 'active',
            label: 'Active',
            value: taskStats.active,
            icon: MdCheckCircle,
            colors: 'bg-green-100 text-green-600',
            activeColors: 'bg-green-50 border-green-200'
        },
        {
            key: 'overdue',
            label: 'Overdue',
            value: taskStats.overdue,
            icon: MdWarning,
            colors: 'bg-red-100 text-red-600',
            activeColors: 'bg-red-50 border-red-200'
        },
        {
            key: 'completed',
            label: 'Completed',
            value: taskStats.completed,
            icon: MdPending,
            colors: 'bg-purple-100 text-purple-600',
            activeColors: 'bg-purple-50 border-purple-200'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {statsConfig.map((stat) => {
                const Icon = stat.icon;
                return (
                    <button
                        key={stat.key}
                        onClick={() => setFilterStatus(stat.key)}
                        className={`text-left p-6 rounded-xl border transition-all ${filterStatus === stat.key
                                ? stat.activeColors
                                : 'bg-white border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-12 h-12 ${stat.colors.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg flex items-center justify-center`}>
                                <Icon className={`${stat.colors} text-xl`} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </button>
                );
            })}

            {/* Last column - Grade or Submission Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="text-center">
                    {userRole === 'teacher' ? (
                        <>
                            <p className="text-sm text-gray-600 mb-2">Average Grade</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tasks.length > 0 ? '85%' : '0%'}
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 mb-2">Submitted</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {submittedTasksCount}/{tasks.length}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TasksStats;
