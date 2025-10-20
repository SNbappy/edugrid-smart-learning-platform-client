import { useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../providers/AuthProvider';
import useAxiosPublic from '../hooks/useAxiosPublic';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    const axiosPublic = useAxiosPublic();
    const [verificationLoading, setVerificationLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const checkVerification = async () => {
            if (user && user.email) {
                try {
                    console.log('🔍 Checking verification status for:', user.email);
                    const response = await axiosPublic.get(`/users/${user.email}`);
                    const dbUser = response.data.user;

                    console.log('Verification status:', dbUser.emailVerified);
                    setIsVerified(dbUser.emailVerified === true);
                } catch (error) {
                    console.error('Error checking verification:', error);
                    // If check fails, assume verified (fail-safe)
                    setIsVerified(true);
                } finally {
                    setVerificationLoading(false);
                }
            } else {
                setVerificationLoading(false);
            }
        };

        if (!loading) {
            checkVerification();
        }
    }, [user, loading, axiosPublic]);

    // Show loader while checking auth or verification
    if (loading || verificationLoading) {
        return (
            <div className="min-h-screen bg-[#DCE8F5] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#457B9D] mb-4"></div>
                <p className="text-slate-600 font-medium">Loading...</p>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but not verified - redirect to verification page
    if (!isVerified) {
        console.log('⚠️ User not verified - redirecting to verification page');
        return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
    }

    // Logged in and verified - allow access
    return children;
};

export default PrivateRoute;
