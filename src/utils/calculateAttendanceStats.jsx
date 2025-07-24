import { MdCheckCircle, MdCancel, MdQuestionMark } from 'react-icons/md';

// Calculate attendance statistics based on user role
export const calculateAttendanceStats = (attendanceSessions, classroom, user, isOwner) => {
    if (!attendanceSessions.length || !classroom?.students?.length) {
        return { totalSessions: 0, averageAttendance: 0 };
    }

    const totalSessions = attendanceSessions.length;

    if (isOwner) {
        // Owner sees overall class statistics
        const totalPossibleAttendance = totalSessions * classroom.students.length;
        const totalPresent = attendanceSessions.reduce((sum, session) => {
            return sum + session.attendance.filter(record => record.status === 'present').length;
        }, 0);

        return {
            totalSessions,
            averageAttendance: totalPossibleAttendance > 0 ? Math.round((totalPresent / totalPossibleAttendance) * 100) : 0
        };
    } else {
        // Student sees only their own statistics
        const studentAttendance = attendanceSessions.reduce((sum, session) => {
            const studentRecord = session.attendance.find(record => record.studentEmail === user.email);
            return sum + (studentRecord?.status === 'present' ? 1 : 0);
        }, 0);

        return {
            totalSessions,
            averageAttendance: totalSessions > 0 ? Math.round((studentAttendance / totalSessions) * 100) : 0
        };
    }
};

// Get status icon component
export const getStatusIcon = (status) => {
    switch (status) {
        case 'present':
            return <MdCheckCircle className="text-green-500" />;
        case 'absent':
            return <MdCancel className="text-red-500" />;
        case 'late':
            return <MdQuestionMark className="text-yellow-500" />;
        default:
            return <MdQuestionMark className="text-gray-400" />;
    }
};

// Get status color classes
export const getStatusColor = (status) => {
    switch (status) {
        case 'present':
            return 'bg-green-100 text-green-800';
        case 'absent':
            return 'bg-red-100 text-red-800';
        case 'late':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Get status styling for cards
export const getStatusStyle = (status) => {
    switch (status) {
        case 'present':
            return {
                textColor: 'text-green-600',
                bgColor: 'bg-green-100 text-green-800'
            };
        case 'absent':
            return {
                textColor: 'text-red-600',
                bgColor: 'bg-red-100 text-red-800'
            };
        case 'late':
            return {
                textColor: 'text-yellow-600',
                bgColor: 'bg-yellow-100 text-yellow-800'
            };
        default:
            return {
                textColor: 'text-gray-600',
                bgColor: 'bg-gray-100 text-gray-800'
            };
    }
};

// Filter sessions based on user role
export const filterSessionsForUser = (sessions, isOwner, userEmail) => {
    if (isOwner) {
        return sessions;
    }

    // For students, return sessions with only their attendance record
    return sessions.map(session => ({
        ...session,
        attendance: session.attendance.filter(record => record.studentEmail === userEmail)
    }));
};

// Calculate session statistics
export const getSessionStats = (session) => {
    const presentCount = session.attendance.filter(record => record.status === 'present').length;
    const absentCount = session.attendance.filter(record => record.status === 'absent').length;
    const lateCount = session.attendance.filter(record => record.status === 'late').length;
    const unmarkedCount = session.attendance.filter(record => record.status === 'unmarked').length;
    const totalStudents = session.attendance.length;
    const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return {
        presentCount,
        absentCount,
        lateCount,
        unmarkedCount,
        totalStudents,
        attendancePercentage
    };
};
