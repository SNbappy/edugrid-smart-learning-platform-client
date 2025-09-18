import { useState, useEffect } from 'react';

export const useUserRole = (user, classroom) => {
    const [userRole, setUserRole] = useState('student');

    useEffect(() => {
        if (user && classroom) {
            console.log('Checking user role for:', user.email);
            console.log('Classroom created by:', classroom.createdBy);
            console.log('Classroom teachers:', classroom.teachers);

            if (classroom.createdBy === user.email ||
                classroom.teachers?.includes(user.email) ||
                classroom.owner === user.email ||
                classroom.instructors?.includes(user.email)) {
                console.log('User is a teacher');
                setUserRole('teacher');
            } else {
                console.log('User is a student');
                setUserRole('student');
            }
        }
    }, [user, classroom]);

    return userRole;
};
