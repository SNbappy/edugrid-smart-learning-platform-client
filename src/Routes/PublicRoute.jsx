import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#DCE8F5]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#457B9D]"></div>
            </div>
        );
    }

    // ✅ CRITICAL: Allow access to verify-email page even when logged out
    if (location.pathname === '/verify-email') {
        return children;
    }

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // If not logged in, allow access to the public route
    return children;
};

export default PublicRoute;
