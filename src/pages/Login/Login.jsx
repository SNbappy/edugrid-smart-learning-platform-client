import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';


const Login = () => {
    const { signIn, signInWithGoogle } = useContext(AuthContext);
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
            console.log('Email/Password login successful:', user.email);

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
            Swal.fire({
                icon: 'error',
                title: 'Login Failed!',
                text: 'Invalid email or password. Please try again.',
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

            await checkAndCreateUser(user, 'google');

            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Signed in with Google successfully",
                showConfirmButton: false,
                timer: 1500
            });
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Google sign-in error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to sign in with Google. Please try again.',
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
                                Sign in with Google
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