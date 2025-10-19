import { useContext, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";


const SignUp = () => {
    const axiosPublic = useAxiosPublic();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();

    const { createUser, updateUserProfile, signInWithGoogle } = useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log('Starting sign up process...');
        console.log('Form data:', data);

        try {
            const result = await createUser(data.email, data.password);
            const loggedUser = result.user;
            console.log('Firebase user created:', loggedUser);

            await updateUserProfile(data.name, data.photoURL || "");
            console.log('Firebase profile updated');

            const userInfo = {
                name: data.name,
                email: data.email,
                photoURL: data.photoURL || "",
                loginMethod: 'email_password',
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

            console.log('Sending to backend:', userInfo);

            const res = await axiosPublic.post('/users', userInfo);
            console.log('Backend response:', res.data);

            if (res.data.insertedId || res.data.message === 'User created successfully') {
                console.log('User successfully saved to database');
                reset();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Account created successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/dashboard');
            } else {
                console.log('Unexpected response from backend');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            console.error('Error details:', error.response?.data);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to create account. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            setIsLoading(true);
            console.log('Starting Google sign up process...');

            const result = await signInWithGoogle();
            const user = result.user;
            console.log('Google authentication successful:', user);

            const userInfo = {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL || "",
                loginMethod: 'google',
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

            console.log('Sending to /api/users endpoint:', userInfo);

            const res = await axiosPublic.post('/users', userInfo);
            console.log('User creation response:', res.data);

            if (res.data.insertedId || res.data.message === 'User created successfully') {
                console.log('User successfully saved to USERS collection');
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Account created with Google successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Google sign-up error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#DCE8F5] font-poppins text-black min-h-screen">
            <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
                <Helmet>
                    <title>EduGrid | Sign Up</title>
                </Helmet>

                <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-6 lg:gap-8 py-6 lg:py-8">
                    {/* Form Container */}
                    <div className="bg-[#DCE8F5]/30 rounded-[20px] lg:rounded-[30px] shadow-2xl px-6 sm:px-10 md:px-16 lg:px-[70px] w-full lg:w-1/2 py-8 sm:py-12 lg:pt-[80px] lg:pb-[40px]">
                        <p className="font-bold text-2xl sm:text-[26px] lg:text-[28.5px] pb-4 lg:pb-5">Create a new account</p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <p className="font-medium text-xs sm:text-sm pb-1">Enter Your Name</p>
                            <input
                                type="text"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="Your Full Name"
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />
                            {errors.name && (
                                <span className="text-red-500 text-xs sm:text-sm block mt-[-16px] sm:mt-[-25px] mb-4 sm:mb-5">
                                    {errors.name.message}
                                </span>
                            )}

                            <p className="font-medium text-xs sm:text-sm pb-1">Enter an Email Address</p>
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                placeholder="username@gmail.com"
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />
                            {errors.email && (
                                <span className="text-red-500 text-xs sm:text-sm block mt-[-16px] sm:mt-[-25px] mb-4 sm:mb-5">
                                    {errors.email.message}
                                </span>
                            )}

                            <p className="font-medium text-xs sm:text-sm pb-1">Enter Password</p>
                            <input
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 8,
                                        message: 'Password must be at least 8 characters'
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                                        message: 'Password must include uppercase, lowercase, number, and special character (@$!%*?&#)'
                                    }
                                })}
                                placeholder="Password"
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />
                            {errors.password && (
                                <span className="text-red-500 text-xs sm:text-sm block mt-[-16px] sm:mt-[-25px] mb-4 sm:mb-5">
                                    {errors.password.message}
                                </span>
                            )}

                            {/* Password Requirements */}
                            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 sm:p-4 mb-5 sm:mb-6">
                                <p className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">Password Requirements:</p>
                                <ul className="text-[10px] sm:text-xs text-gray-600 space-y-1">
                                    <li>• At least 8 characters long</li>
                                    <li>• One uppercase letter (A-Z)</li>
                                    <li>• One lowercase letter (a-z)</li>
                                    <li>• One number (0-9)</li>
                                    <li>• One special character (@$!%*?&#)</li>
                                </ul>
                            </div>

                            <p className="font-medium text-xs sm:text-sm pb-1">Confirm Password</p>
                            <input
                                type="password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === watch('password') || 'Passwords do not match'
                                })}
                                placeholder="Confirm Password"
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                            />
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-xs sm:text-sm block mt-[-16px] sm:mt-[-25px] mb-4 sm:mb-5">
                                    {errors.confirmPassword.message}
                                </span>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-3 sm:py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                            >
                                {isLoading ? 'Creating Account...' : 'Sign up'}
                            </button>
                        </form>

                        <p className="text-xs sm:text-sm py-5 sm:py-[30px] text-center font-medium">or continue with</p>

                        <div className="flex justify-center">
                            <button
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 sm:gap-3 w-full bg-white border border-gray-300 py-2.5 sm:py-3 px-3 sm:px-4 rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700 text-sm sm:text-base"
                            >
                                <img
                                    src="LoginImg/Google__G__logo.svg.png"
                                    alt="Google"
                                    className="w-4 h-4 sm:w-5 sm:h-5"
                                />
                                {isLoading ? 'Creating Account...' : 'Sign up with Google'}
                            </button>
                        </div>

                        <div className="text-center mt-5 sm:mt-6">
                            <p className="text-xs sm:text-sm font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#457B9D] hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="hidden lg:block lg:w-1/2">
                        <img
                            src="LoginImg/upscalemedia-transformed.png"
                            alt="Sign up illustration"
                            className="w-full max-w-[600px] mx-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
