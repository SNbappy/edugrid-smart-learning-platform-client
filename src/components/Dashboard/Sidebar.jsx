import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../providers/AuthProvider';

const Sidebar = () => {
    const { user, logOut } = useContext(AuthContext);
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: '🏠', path: '/dashboard', active: true },
        { name: 'Courses', icon: '📚', path: '/courses' },
        { name: 'Exams', icon: '📝', path: '/exams' },
        { name: 'Homework', icon: '✅', path: '/homework' },
        { name: 'Students', icon: '👥', path: '/students' },
        { name: 'Attendance', icon: '📊', path: '/attendance' },
        { name: 'Duties', icon: '📋', path: '/duties' },
        { name: 'Grading', icon: '🎓', path: '/grading' },
    ];

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="fixed left-0 top-0 h-full w-64 bg-[#e3f2fd] border-r border-blue-200 z-10">
            {/* Profile Section */}
            <div className="p-6 border-b border-blue-200">
                <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
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
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                            {user?.displayName || 'User'}
                        </h3>
                        <p className="text-xs text-gray-600">Applied Science Teacher</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="mt-6">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        to={item.path}
                        className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${location.pathname === item.path
                                ? 'bg-[#457B9D] text-white border-r-4 border-blue-600'
                                : 'text-gray-700 hover:bg-blue-100'
                            }`}
                    >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-4 left-4 right-4">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                    <span className="mr-2">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
