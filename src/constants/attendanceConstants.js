// Attendance status options
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    UNMARKED: 'unmarked'
};

// Status display labels
export const STATUS_LABELS = {
    [ATTENDANCE_STATUS.PRESENT]: 'Present',
    [ATTENDANCE_STATUS.ABSENT]: 'Absent',
    [ATTENDANCE_STATUS.LATE]: 'Late',
    [ATTENDANCE_STATUS.UNMARKED]: 'Unmarked'
};

// Default form values
export const DEFAULT_SESSION_FORM = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
};

// Permission levels
export const USER_ROLES = {
    OWNER: 'owner',
    STUDENT: 'student'
};
