import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';


const Login = () => {
    const { signIn, signInWithGoogle, logOut } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    const checkAndCreateUser = async (user, loginMethod) => {
        try {
            console.log('🔍 Checking if user exists:', user.email);
            console.log('User already exists in database');
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('User not found, creating new user...');

                const userData = {
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    photoURL: user.photoURL || '',
                    loginMethod: loginMethod,
                    createdAt: new Date(),
                    role: 'user',
                    emailVerified: true, // Google users are pre-verified
                    profile: {
                        bio: '',
                        institution: '',
                        country: '',
                        district: '',
                        city: '',
                        facebook: '',
                        linkedin: '',
                        mailLink: ''
                    }
                };

                console.log('Creating user with data:', userData);
                const createResponse = await axiosPublic.post('/users', userData);
                console.log('User created successfully:', createResponse.data);
            } else {
                console.error('Error checking user existence:', error);
            }
        }
    };


    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const result = await signIn(email, password);
            const user = result.user;
            console.log('Firebase login successful:', user.email);

            // ✅ CHECK DATABASE FOR EMAIL VERIFICATION STATUS
            try {
                const userResponse = await axiosPublic.get(`/users/${email}`);

                console.log('API Response:', userResponse.data);

                // Access the user object from response
                const dbUser = userResponse.data.user;

                if (!dbUser) {
                    console.log('⚠️ User not found in database');
                    throw new Error('User not found in database');
                }

                console.log('Database user:', dbUser);
                console.log('Email verified status:', dbUser.emailVerified);
                console.log('Login method:', dbUser.loginMethod);

                // ✅ FIX: Skip verification check for Google users
                if (dbUser.loginMethod === 'google') {
                    console.log('✅ Google user - skipping email verification check');
                } else if (dbUser.emailVerified !== true) {
                    // Only check verification for email/password users
                    console.log('⚠️ Email not verified - blocking access');

                    // Log out immediately
                    await logOut();

                    const result = await Swal.fire({
                        icon: 'warning',
                        title: 'Email Not Verified',
                        html: `
                            <div class="text-left">
                                <p class="mb-3 text-gray-700">Please verify your email before logging in.</p>
                                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                    <p class="text-sm text-blue-700 mb-2">
                                        A verification code was sent to:<br/>
                                        <strong>${email}</strong>
                                    </p>
                                    <p class="text-xs text-blue-600">
                                        Check your inbox for the 6-digit verification code.
                                    </p>
                                </div>
                            </div>
                        `,
                        showCancelButton: true,
                        confirmButtonText: 'Verify Now',
                        cancelButtonText: 'Cancel',
                        confirmButtonColor: '#457B9D',
                        cancelButtonColor: '#6B7280'
                    });

                    if (result.isConfirmed) {
                        // Send new verification code
                        try {
                            await axiosPublic.post('/send-verification-code', { email });
                            console.log('New verification code sent');
                        } catch (error) {
                            console.error('Failed to send code:', error);
                        }

                        // Navigate to verification page
                        navigate('/verify-email', { state: { email } });
                    }

                    setIsLoading(false);
                    return; // Block login
                }

                // ✅ Email is verified OR user is Google user - allow login
                console.log('✅ Access granted');

            } catch (dbError) {
                console.error('Error checking user in database:', dbError);

                // If user not found in database but exists in Firebase
                if (dbError.response?.status === 404) {
                    console.log('⚠️ User exists in Firebase but not in database - logging out');
                    await logOut();
                    Swal.fire({
                        icon: 'error',
                        title: 'Account Error',
                        text: 'Your account setup is incomplete. Please sign up again.',
                        confirmButtonColor: '#457B9D'
                    });
                    setIsLoading(false);
                    return;
                }

                // For other errors, allow login (fail-safe)
                console.log('⚠️ Database check failed - allowing login as fail-safe');
            }

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Login Successful",
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/dashboard', { replace: true });

        } catch (error) {
            console.error('Login error:', error);

            let errorMessage = 'Invalid email or password. Please try again.';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please sign up first.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again or reset your password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled. Please contact support.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Login Failed!',
                text: errorMessage,
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsLoading(false);
        }
    };


    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            console.log('Starting Google sign-in...');

            const result = await signInWithGoogle();
            const user = result.user;
            console.log('Google authentication successful:', user.email);

            // ✅ Check if user already exists in database
            try {
                const userResponse = await axiosPublic.get(`/users/${user.email}`);

                if (userResponse.data.user) {
                    // User exists - direct login
                    console.log('✅ Existing Google user - logging in');
                    Swal.fire({
                        position: "top-end",
                        icon: "success",
                        title: "Signed in with Google successfully",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    navigate('/dashboard', { replace: true });
                }
            } catch (error) {
                // User doesn't exist (404) - redirect to complete profile
                if (error.response?.status === 404) {
                    console.log('🆕 New Google user - redirecting to complete profile');
                    navigate('/complete-profile', { replace: true });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Google sign-in error:', error);

            let errorMessage = 'Failed to sign in with Google. Please try again.';

            if (error.message.includes('popup')) {
                errorMessage = 'Sign-in popup was closed. Please try again.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Google Sign-In Failed!',
                text: errorMessage,
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="bg-[#DCE8F5] font-poppins text-black min-h-screen">
            <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
                <Helmet>
                    <title>EduGrid | Login</title>
                    <meta name="description" content="Login to EduGrid - Smart Learning Platform. Access your classes, assignments, and educational resources." />
                    <meta name="robots" content="index, follow" />
                </Helmet>

                <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-6 lg:gap-8 py-6 lg:py-8">
                    {/* Form Container */}
                    <div className="bg-[#DCE8F5]/30 rounded-[20px] lg:rounded-[30px] shadow-2xl px-6 sm:px-10 md:px-16 lg:px-[70px] w-full lg:w-1/2 py-8 sm:py-12 lg:pt-[80px] lg:pb-[40px]">
                        <p className="font-bold text-2xl sm:text-[26px] lg:text-[28.5px] pb-4 lg:pb-5">Welcome back</p>

                        <form onSubmit={handleLogin}>
                            <p className="font-medium text-xs sm:text-sm pb-1">Enter an Email Address</p>
                            <input
                                type="email"
                                name="email"
                                placeholder="username@gmail.com"
                                required
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />

                            <p className="font-medium text-xs sm:text-sm pb-1">Enter Password</p>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-4 sm:mb-[20px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />

                            <div className="text-right mb-5 sm:mb-[30px]">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs sm:text-sm text-[#457B9D] hover:underline font-medium"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-3 sm:py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-xs sm:text-sm py-5 sm:py-[30px] text-center font-medium">or continue with</p>

                        <div className="flex justify-center">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 sm:gap-3 w-full bg-white border border-gray-300 py-2.5 sm:py-3 px-3 sm:px-4 rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 text-sm sm:text-base"
                            >
                                <img
                                    src="LoginImg/Google__G__logo.svg.png"
                                    alt="Google"
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                />
                                {isLoading ? 'Signing in...' : 'Sign in with Google'}
                            </button>
                        </div>

                        <div className="text-center mt-5 sm:mt-6">
                            <p className="text-xs sm:text-sm font-medium">
                                Don't have an account?{' '}
                                <Link to="/sign-up" className="text-[#457B9D] hover:underline">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="hidden lg:block lg:w-1/2">
                        <img
                            src="LoginImg/upscalemedia-transformed.png"
                            alt="Login illustration"
                            className="w-full max-w-[600px] mx-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Login;
