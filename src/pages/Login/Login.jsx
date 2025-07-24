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
    // const location = useLocation();

    // const from = location.state?.from?.pathname || "/";

    const checkAndCreateUser = async (user, loginMethod) => {
        try {
            console.log('🔍 Checking if user exists:', user.email);

            // const checkResponse = await axiosPublic.get(`/users/${user.email}`);
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
                    role: 'user',  // ✅ Changed from 'teacher' to 'user'
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
        <div className="bg-[#DCE8F5] font-poppins text-black">
            <div className="max-w-[1250px] mx-auto">
                <Helmet>
                    <title>EduGrid | Login</title>
                </Helmet>

                <div className="flex justify-between">
                    <div className="bg-[#DCE8F5]/30 rounded-[30px] shadow-2xl px-[70px] w-1/2 pt-[80px] pb-[40px] mb-[63px] mt-[30px]">
                        <p className="font-bold text-[28.5px] pb-5">Welcome back</p>

                        <form onSubmit={handleLogin}>
                            <p className="font-medium text-sm pb-1">Enter an Email Address</p>
                            <input
                                type="email"
                                name="email"
                                placeholder="username@gmail.com"
                                required
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px]"
                            />

                            <p className="font-medium text-sm pb-1">Enter Password</p>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[20px]"
                            />

                            <div className="text-right mb-[30px]">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-[#457B9D] hover:underline font-medium"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-sm py-[30px] text-center font-medium">or continue with</p>

                        <div className="flex justify-center">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 py-3 px-4 rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                            >
                                <img
                                    src="LoginImg/Google__G__logo.svg.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Sign in with Google
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm font-medium">
                                Don't have an account?{' '}
                                <Link to="/sign-up" className="text-[#457B9D] hover:underline">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div>
                        <img
                            src="LoginImg/upscalemedia-transformed.png"
                            alt="Login illustration"
                            className="w-full mt-[100px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
