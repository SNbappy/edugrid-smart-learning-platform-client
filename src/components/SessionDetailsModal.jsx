import { useState, useEffect } from 'react';
import {
    MdClose,
    MdPeople,
    MdCheckCircle,
    MdCancel,
    MdSchedule,
    MdDateRange,
    MdSave,
    MdVisibility,
    MdSearch,
    MdFilterList
} from 'react-icons/md';

const SessionDetailsModal = ({
    session,
    onClose,
    onUpdateAttendance,
    isOwner,
    currentUserEmail,
    classroomName
}) => {
    const [localAttendance, setLocalAttendance] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (session?.attendance) {
            setLocalAttendance([...session.attendance]);
        }
    }, [session]);

    const handleStatusChange = (studentEmail, newStatus) => {
        if (!isOwner) return;

        const updatedAttendance = localAttendance.map(record =>
            record.studentEmail === studentEmail
                ? { ...record, status: newStatus, markedAt: new Date(), markedBy: currentUserEmail }
                : record
        );

        setLocalAttendance(updatedAttendance);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!hasChanges || !isOwner) return;

        setIsSaving(true);
        try {
            // Find changed records and update them
            const changes = localAttendance.filter((record, index) => {
                const originalRecord = session.attendance[index];
                return record.status !== originalRecord?.status;
            });

            for (const change of changes) {
                await onUpdateAttendance(session.id, change.studentEmail, change.status);
            }

            setHasChanges(false);
        } catch (error) {
            console.error('Error saving attendance:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'present':
                return {
                    bg: 'bg-emerald-50 border-emerald-200',
                    text: 'text-emerald-700',
                    icon: MdCheckCircle,
                    iconColor: 'text-emerald-600',
                    badge: 'bg-emerald-100 text-emerald-800'
                };
            case 'absent':
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-700',
                    icon: MdCancel,
                    iconColor: 'text-red-600',
                    badge: 'bg-red-100 text-red-800'
                };
            default:
                return {
                    bg: 'bg-slate-50 border-slate-200',
                    text: 'text-slate-700',
                    icon: MdSchedule,
                    iconColor: 'text-slate-500',
                    badge: 'bg-slate-100 text-slate-800'
                };
        }
    };

    // Filter and search logic
    const filteredAttendance = localAttendance.filter(record => {
        const matchesSearch = !searchTerm ||
            record.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || record.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const presentCount = localAttendance.filter(record => record.status === 'present').length;
    const absentCount = localAttendance.filter(record => record.status === 'absent').length;
    const unmarkedCount = localAttendance.filter(record => record.status === 'unmarked').length;
    const totalStudents = localAttendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Professional Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Container - Compact Design */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-4xl mx-auto h-[85vh] flex flex-col transform transition-all duration-300 scale-100 animate-in zoom-in-95">

                {/* Compact Header */}
                <div className="flex-shrink-0">
                    {/* Title Bar */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MdVisibility className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-slate-900 truncate">{session?.title}</h3>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                    <span className="flex items-center">
                                        <MdDateRange className="w-3 h-3 mr-1" />
                                        {new Date(session?.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                        <MdPeople className="w-3 h-3 mr-1" />
                                        {totalStudents} students
                                    </span>
                                    {isOwner && (
                                        <span className={`font-medium ${attendancePercentage >= 80 ? 'text-emerald-600' :
                                                attendancePercentage >= 60 ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {attendancePercentage}% attendance
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {isOwner && hasChanges && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-amber-600 font-medium">Unsaved</span>
                                </div>
                            )}
                            {isOwner && hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-md transition-all duration-200"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                            <span>Saving</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="w-3 h-3 mr-1" />
                                            <span>Save</span>
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors duration-200 text-slate-400 hover:text-slate-600"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Compact Stats & Controls Bar */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center space-x-4">
                            {isOwner && (
                                <>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <span className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md">
                                            <MdCheckCircle className="w-3 h-3 mr-1" />
                                            {presentCount}
                                        </span>
                                        <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md">
                                            <MdCancel className="w-3 h-3 mr-1" />
                                            {absentCount}
                                        </span>
                                        <span className="flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                                            <MdSchedule className="w-3 h-3 mr-1" />
                                            {unmarkedCount}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Search and Filter - Compact */}
                        {isOwner && (
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <MdSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-48 pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="all">All</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="unmarked">Unmarked</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Student List */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="p-4">
                        <div className="space-y-3">
                            {filteredAttendance.length === 0 ? (
                                <div className="text-center py-12">
                                    <MdPeople className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-base font-semibold text-slate-600 mb-2">No Students Found</h3>
                                    <p className="text-sm text-slate-500">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'No students match the current filter.'}
                                    </p>
                                </div>
                            ) : (
                                filteredAttendance.map((record, index) => {
                                    const style = getStatusStyle(record.status);
                                    const IconComponent = style.icon;
                                    const isCurrentUser = record.studentEmail === currentUserEmail;

                                    return (
                                        <div
                                            key={record.studentEmail || index}
                                            className={`bg-white flex items-center justify-between p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-50' : 'border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
                                                    <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium text-slate-900 truncate">
                                                            {record.studentName || record.studentEmail?.split('@')[0] || 'Unknown Student'}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                                You
                                                            </span>
                                                        )}
                                                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${style.badge} capitalize`}>
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-500 truncate">
                                                        {record.studentEmail}
                                                    </div>
                                                </div>
                                            </div>

                                            {isOwner ? (
                                                <div className="flex space-x-2 ml-3">
                                                    <button
                                                        onClick={() => handleStatusChange(record.studentEmail, 'present')}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${record.status === 'present'
                                                                ? 'bg-emerald-600 text-white shadow-md'
                                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(record.studentEmail, 'absent')}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${record.status === 'absent'
                                                                ? 'bg-red-600 text-white shadow-md'
                                                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${style.bg} ${style.text} capitalize`}>
                                                    {record.status}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Compact Footer */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                        {filteredAttendance.length} of {totalStudents} students
                        {searchTerm && <span className="text-slate-400"> (filtered)</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        {isOwner && hasChanges && (
                            <button
                                onClick={() => {
                                    setLocalAttendance([...session.attendance]);
                                    setHasChanges(false);
                                }}
                                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
                            >
                                Reset
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsModal;
