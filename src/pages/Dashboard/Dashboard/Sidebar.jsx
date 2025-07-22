import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../providers/AuthProvider';
import {
    MdDashboard,
    MdSchool,
    MdAssignment,
    MdAssignmentTurnedIn,
    MdPeople,
    MdBarChart,
    MdTask,
    MdGrade,
    MdLogout,
    MdEdit
} from 'react-icons/md';

const Sidebar = () => {
    const { user, logOut } = useContext(AuthContext);
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
        { name: 'Courses', icon: MdSchool, path: '/courses' },
        { name: 'Exams', icon: MdAssignment, path: '/exams' },
        { name: 'Homework', icon: MdAssignmentTurnedIn, path: '/homework' },
        { name: 'Students', icon: MdPeople, path: '/students' },
        { name: 'Attendance', icon: MdBarChart, path: '/attendance' },
        { name: 'Duties', icon: MdTask, path: '/duties' },
        { name: 'Grading', icon: MdGrade, path: '/grading' },
    ];

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="fixed left-0 top-0 h-full w-[272px] bg-[#DCE8F5] z-10 text-[#457B9D] font-montserrat">
            <div className="pt-[45px]">
                <div className="">
                    <div className="w-[100px] rounded-full overflow-hidden flex items-center justify-center border-4 mx-auto">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-xl font-bold">
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </span>
                        )}
                    </div>
                    <div className='px-5'>
                        <h3 className="font-semibold text-lg text-center">
                            {user?.displayName || 'User'}
                        </h3>
                        <p className="text-sm text-center font-medium">Applied Science Teacher</p>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-4">
                <Link
                    to="/edit-profile"
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-[#457B9D] bg-white rounded-md hover:bg-gray-50 transition-colors border border-[#457B9D]"
                >
                    <MdEdit className="mr-2 text-lg" />
                    Edit Details
                </Link>
            </div>

            <nav className="mt-6">
                {menuItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${location.pathname === item.path
                                ? 'bg-[#457B9D] text-white'
                                : 'hover:bg-blue-100'
                                }`}
                        >
                            <IconComponent className="mr-3 text-lg" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                    <MdLogout className="mr-2 text-lg" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
