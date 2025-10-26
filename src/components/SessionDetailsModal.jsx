import { useState, useEffect, useMemo } from 'react';
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
import useAxiosPublic from '../hooks/useAxiosPublic';

const SessionDetailsModal = ({
    session,
    onClose,
    onUpdateAttendance,
    isOwner,
    currentUserEmail,
    classroomName,
    allClassroomStudents = [],
    teacherEmail = ''
}) => {
    const axiosPublic = useAxiosPublic();
    const [localAttendance, setLocalAttendance] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isLoadingNames, setIsLoadingNames] = useState(false);

    // Merge session attendance with all enrolled students
    const completeAttendance = useMemo(() => {
        const sessionAttendance = session?.attendance || [];

        const sessionEmailsMap = new Map();
        sessionAttendance.forEach(record => {
            if (record.studentEmail) {
                sessionEmailsMap.set(record.studentEmail.toLowerCase(), record);
            }
        });

        const studentsOnly = allClassroomStudents.filter(
            student => student.email && student.email.toLowerCase() !== teacherEmail.toLowerCase()
        );

        const mergedList = studentsOnly.map(student => {
            const emailLower = student.email.toLowerCase();

            if (sessionEmailsMap.has(emailLower)) {
                return sessionEmailsMap.get(emailLower);
            }

            return {
                studentEmail: student.email,
                studentName: student.name,
                status: 'unmarked',
                markedAt: null,
                markedBy: null
            };
        });

        // Sort by student name (ascending order)
        const sortedList = mergedList.sort((a, b) => {
            const nameA = (a.studentName || a.studentEmail || '').toLowerCase();
            const nameB = (b.studentName || b.studentEmail || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        console.log('📊 Modal Attendance Merge Debug:', {
            sessionId: session?.id,
            originalRecords: sessionAttendance.length,
            enrolledStudents: studentsOnly.length,
            mergedTotal: sortedList.length,
            existing: sortedList.filter(r => r.status !== 'unmarked').length,
            newUnmarked: sortedList.filter(r => r.status === 'unmarked').length
        });

        return sortedList;
    }, [session?.id, session?.attendance, allClassroomStudents, teacherEmail]);

    // Fetch updated user names from database
    const fetchUpdatedUserNames = async (attendanceRecords) => {
        setIsLoadingNames(true);
        try {
            const updatedRecords = await Promise.all(
                attendanceRecords.map(async (record) => {
                    try {
                        const response = await axiosPublic.get(`/users/${record.studentEmail}`);

                        if (response.data.success && response.data.user) {
                            const userData = response.data.user;
                            return {
                                ...record,
                                studentName: userData.name || record.studentEmail?.split('@')[0] || 'Unknown Student'
                            };
                        }
                        return record;
                    } catch (error) {
                        console.error(`Error fetching user data for ${record.studentEmail}:`, error);
                        return record;
                    }
                })
            );

            // Sort again after fetching updated names
            const sortedRecords = updatedRecords.sort((a, b) => {
                const nameA = (a.studentName || a.studentEmail || '').toLowerCase();
                const nameB = (b.studentName || b.studentEmail || '').toLowerCase();
                return nameA.localeCompare(nameB);
            });

            return sortedRecords;
        } catch (error) {
            console.error('Error updating user names:', error);
            return attendanceRecords;
        } finally {
            setIsLoadingNames(false);
        }
    };

    // Load attendance data whenever session or students change
    useEffect(() => {
        const loadAttendanceData = async () => {
            console.log('🔄 Loading attendance data for session:', session?.id);
            if (completeAttendance.length > 0) {
                const updatedRecords = await fetchUpdatedUserNames(completeAttendance);
                setLocalAttendance(updatedRecords);
            } else {
                setLocalAttendance([]);
            }
        };

        loadAttendanceData();
    }, [session?.id, JSON.stringify(session?.attendance), allClassroomStudents.length, teacherEmail]); // ✅ Fixed dependencies

    // Reset state when session changes
    useEffect(() => {
        setHasChanges(false);
        setSearchTerm('');
        setFilterStatus('all');
    }, [session?.id]);

    const handleStatusChange = (studentEmail, newStatus) => {
        if (!isOwner) return;

        const updatedAttendance = localAttendance.map(record =>
            record.studentEmail === studentEmail
                ? { ...record, status: newStatus, markedAt: new Date(), markedBy: currentUserEmail }
                : record
        );

        // Keep sorted order after status change
        const sortedAttendance = updatedAttendance.sort((a, b) => {
            const nameA = (a.studentName || a.studentEmail || '').toLowerCase();
            const nameB = (b.studentName || b.studentEmail || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        setLocalAttendance(sortedAttendance);
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!hasChanges || !isOwner) return;

        setIsSaving(true);
        try {
            const changes = localAttendance.filter((record) => {
                const originalRecord = completeAttendance.find(
                    r => r.studentEmail === record.studentEmail
                );
                return record.status !== originalRecord?.status;
            });

            console.log('💾 Saving changes:', changes.length);

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

    // Filter and search logic (maintains sorted order)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Professional Blurred Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Container - Fully Responsive */}
            <div className="relative bg-white rounded-lg sm:rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto h-[95vh] sm:h-[90vh] md:h-[85vh] flex flex-col transform transition-all duration-300 scale-100 animate-in zoom-in-95">

                {/* Loading Overlay */}
                {isLoadingNames && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg sm:rounded-2xl">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="text-sm text-slate-600 font-medium">Loading updated names...</p>
                        </div>
                    </div>
                )}

                {/* Compact Header */}
                <div className="flex-shrink-0">
                    {/* Title Bar */}
                    <div className="flex items-start sm:items-center justify-between p-3 sm:p-4 border-b border-slate-200 gap-2">
                        <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <MdVisibility className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 truncate">{session?.title}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-1 sm:space-y-0 text-xs text-slate-500">
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

                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                            {isOwner && hasChanges && (
                                <div className="hidden sm:flex items-center space-x-1">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-amber-600 font-medium">Unsaved</span>
                                </div>
                            )}
                            {isOwner && hasChanges && (
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center px-2 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-md transition-all duration-200 touch-manipulation"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                            <span className="hidden sm:inline">Saving</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdSave className="w-3 h-3 sm:mr-1" />
                                            <span className="hidden sm:inline">Save</span>
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors duration-200 text-slate-400 hover:text-slate-600 touch-manipulation"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Stats & Controls Bar - Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-slate-50 border-b border-slate-200 gap-3">
                        {/* Stats */}
                        {isOwner && (
                            <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 text-xs sm:text-sm overflow-x-auto">
                                <span className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md whitespace-nowrap">
                                    <MdCheckCircle className="w-3 h-3 mr-1" />
                                    {presentCount}
                                </span>
                                <span className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md whitespace-nowrap">
                                    <MdCancel className="w-3 h-3 mr-1" />
                                    {absentCount}
                                </span>
                                <span className="flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded-md whitespace-nowrap">
                                    <MdSchedule className="w-3 h-3 mr-1" />
                                    {unmarkedCount}
                                </span>
                            </div>
                        )}

                        {/* Search and Filter - Responsive */}
                        {isOwner && (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                <div className="relative flex-1 sm:flex-none">
                                    <MdSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full sm:w-40 md:w-48 pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="all">All Status</option>
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
                    <div className="p-2 sm:p-3 md:p-4">
                        <div className="space-y-2 sm:space-y-3">
                            {filteredAttendance.length === 0 ? (
                                <div className="text-center py-8 sm:py-12">
                                    <MdPeople className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-600 mb-2">No Students Found</h3>
                                    <p className="text-xs sm:text-sm text-slate-500 px-4">
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
                                            className={`bg-white flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg sm:rounded-xl border transition-all duration-200 hover:shadow-md gap-3 sm:gap-0 ${isCurrentUser ? 'ring-2 ring-blue-500 ring-opacity-50' : 'border-slate-200'
                                                }`}
                                        >
                                            {/* Student Info */}
                                            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                                                    <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                                                        <span className="font-medium text-sm sm:text-base text-slate-900 truncate">
                                                            {record.studentName || record.studentEmail?.split('@')[0] || 'Unknown Student'}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded flex-shrink-0">
                                                                You
                                                            </span>
                                                        )}
                                                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded capitalize flex-shrink-0 ${style.badge}`}>
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-slate-500 truncate">
                                                        {record.studentEmail}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons - Responsive */}
                                            {isOwner ? (
                                                <div className="flex space-x-2 w-full sm:w-auto sm:ml-3">
                                                    <button
                                                        onClick={() => handleStatusChange(record.studentEmail, 'present')}
                                                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0 ${record.status === 'present'
                                                            ? 'bg-emerald-600 text-white shadow-md'
                                                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            }`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(record.studentEmail, 'absent')}
                                                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0 ${record.status === 'absent'
                                                            ? 'bg-red-600 text-white shadow-md'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                            }`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize text-center ${style.bg} ${style.text}`}>
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

                {/* Footer - Responsive */}
                <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 bg-white border-t border-slate-200 gap-2">
                    <div className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">
                        {filteredAttendance.length} of {totalStudents} students
                        {searchTerm && <span className="text-slate-400"> (filtered)</span>}
                    </div>
                    <div className="flex items-center justify-center sm:justify-end space-x-2">
                        {isOwner && hasChanges && (
                            <button
                                onClick={async () => {
                                    const updatedRecords = await fetchUpdatedUserNames(completeAttendance);
                                    setLocalAttendance(updatedRecords);
                                    setHasChanges(false);
                                }}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0"
                            >
                                Reset
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] sm:min-h-0"
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
