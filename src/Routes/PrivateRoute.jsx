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
    const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);


    useEffect(() => {
        const checkVerification = async () => {
            if (user && user.email) {
                try {
                    console.log('🔍 Checking verification status for:', user.email);
                    const response = await axiosPublic.get(`/users/${user.email}`);
                    const dbUser = response.data.user;

                    console.log('Database user:', dbUser);
                    console.log('Login method:', dbUser.loginMethod);
                    console.log('Verification status:', dbUser.emailVerified);

                    // ✅ User exists in database
                    setNeedsProfileCompletion(false);

                    // Check verification based on login method
                    if (dbUser.loginMethod === 'google') {
                        console.log('✅ Google user - auto-verified');
                        setIsVerified(true);
                    } else {
                        console.log('📧 Email/password user - checking verification');
                        setIsVerified(dbUser.emailVerified === true);
                    }
                } catch (error) {
                    console.error('Error checking verification:', error);

                    // ✅ User doesn't exist in database (404)
                    if (error.response?.status === 404) {
                        console.log('⚠️ User not found in database - needs profile completion');
                        setNeedsProfileCompletion(true);
                        setIsVerified(false);
                    } else {
                        // Other errors - assume verified (fail-safe)
                        setIsVerified(true);
                    }
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


    // ✅ NEW: User needs to complete profile (Google users without database entry)
    if (needsProfileCompletion) {
        console.log('⚠️ User needs to complete profile - redirecting');
        // Allow access only to complete-profile page
        if (location.pathname !== '/complete-profile') {
            return <Navigate to="/complete-profile" replace />;
        }
    }


    // Logged in but not verified (email/password users only) - redirect to verification page
    if (!isVerified && !needsProfileCompletion) {
        console.log('⚠️ Email/password user not verified - redirecting to verification page');
        // Allow access only to verify-email page
        if (location.pathname !== '/verify-email') {
            return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
        }
    }


    // Logged in and verified (or on completion/verification pages) - allow access
    console.log('✅ Access granted to protected route');
    return children;
};


export default PrivateRoute;
