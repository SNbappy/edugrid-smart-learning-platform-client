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
        try {
            const result = await createUser(data.email, data.password);
            const loggedUser = result.user;
            console.log(loggedUser);
            
            await updateUserProfile(data.name, data.photoURL || "");
            
            // create user entry in the database
            const userInfo = {
                name: data.name,
                email: data.email
            };
            
            const res = await axiosPublic.post('/users', userInfo);
            
            if (res.data.insertedId) {
                console.log('user added to the database');
                reset();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "User created successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/');
            }
        } catch (error) {
            console.error(error);
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
            const result = await signInWithGoogle();
            const user = result.user;

            // Create user entry in database
            const userInfo = {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL
            };

            const res = await axiosPublic.post('/users', userInfo);

            if (res.data.insertedId || res.data.message === 'user already exists') {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Signed in with Google successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate('/');
            }
        } catch (error) {
            console.error('Google sign-up error:', error);
            // Handle error appropriately
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="bg-[#DCE8F5] font-poppins">
            <div className="max-w-[1250px] mx-auto">
                <Helmet>
                    <title>EduGrid | Sign Up</title>
                </Helmet>

                <div className="flex justify-between">
                    <div className="bg-[#DCE8F5]/30 rounded-[30px] shadow-2xl px-[70px] w-1/2 pt-[80px] pb-[40px] mb-[63px] mt-[30px]">
                        <p className="font-bold text-[28.5px] pb-5">Create a new account</p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <p className="font-medium text-sm pb-1">Enter Your Name</p>
                            <input
                                type="text"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="Your Full Name"
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px]"
                            />
                            {errors.name && (
                                <span className="text-red-500 text-sm block  mt-[-30px] mb-5">
                                    {errors.name.message}
                                </span>
                            )}

                            <p className="font-medium text-sm pb-1">Enter an Email Address</p>
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
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px]"
                            />
                            {errors.email && (
                                <span className="text-red-500 text-sm block  mt-[-30px] mb-5">
                                    {errors.email.message}
                                </span>
                            )}

                            <p className="font-medium text-sm pb-1">Enter Password</p>
                            <input
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters'
                                    }
                                })}
                                placeholder="Password"
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px]"
                            />
                            {errors.password && (
                                <span className="text-red-500 text-sm block  mt-[-30px] mb-5">
                                    {errors.password.message}
                                </span>
                            )}

                            <p className="font-medium text-sm pb-1">Confirm Password</p>
                            <input
                                type="password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) => value === watch('password') || 'Passwords do not match'
                                })}
                                placeholder="Confirm Password"
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px]"
                            />
                            {errors.confirmPassword && (
                                <span className="text-red-500 text-sm block  mt-[-30px] mb-5">
                                    {errors.confirmPassword.message}
                                </span>
                            )}

                            {/* <p className="font-medium text-sm pb-1">Photo URL (Optional)</p>
                        <input
                            type="url"
                            {...register('photoURL')}
                            placeholder="https://example.com/your-photo.jpg"
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px] mb-7"
                        /> */}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Creating Account...' : 'Sign up'}
                            </button>
                        </form>

                        <p className="text-sm py-[30px] text-center font-medium">or continue with</p>

                        {/* <div className="text-center">
                        <p className="text-sm font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#457B9D] hover:underline">
                                Sign in here
                            </Link>
                        </p>
                    </div> */}
                        {/* <p className="text-sm py-[30px] text-center font-medium">or continue with</p> */}

                        <div className="flex justify-center">
                            <button
                                onClick={handleGoogleSignUp}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 py-3 px-4 rounded-[8px] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-700"
                            >
                                <img
                                    src="LoginImg/Google__G__logo.svg.png"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                Sign up with Google
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-sm font-medium">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#457B9D] hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>

                    </div>
                    <div>
                        <img src="LoginImg/upscalemedia-transformed.png" alt="Sign up illustration" className="w-full"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
