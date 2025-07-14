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

    const { createUser, updateUserProfile } = useContext(AuthContext);
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

    return (
        <div className="bg-[#DCE8F5]">
            <Helmet>
                <title>EduGrid | Sign Up</title>
            </Helmet>

            <div className="flex justify-between">
                <div className="bg-[#DCE8F5]/30 rounded-[30px] shadow-2xl px-[70px] w-fit pt-[80px] pb-[40px] ml-[63px]">
                    <p className="font-bold text-[28.5px] pb-5">Create a new account</p>
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p className="font-medium text-sm pb-1">Enter Your Name</p>
                        <input
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            placeholder="Your Full Name"
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-2"
                        />
                        {errors.name && (
                            <span className="text-red-500 text-sm block mb-5">
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
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-2"
                        />
                        {errors.email && (
                            <span className="text-red-500 text-sm block mb-5">
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
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-2"
                        />
                        {errors.password && (
                            <span className="text-red-500 text-sm block mb-5">
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
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-2"
                        />
                        {errors.confirmPassword && (
                            <span className="text-red-500 text-sm block mb-5">
                                {errors.confirmPassword.message}
                            </span>
                        )}
                        
                        {/* <p className="font-medium text-sm pb-1">Photo URL (Optional)</p>
                        <input
                            type="url"
                            {...register('photoURL')}
                            placeholder="https://example.com/your-photo.jpg"
                            className="bg-white rounded-[4px] py-3 pl-4 w-full mb-7"
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
                    <div className="flex justify-between items-center">
                        <img className="w-[70px] bg-white py-2 px-6  rounded-[30px]" src="/public/LoginImg/Google__G__logo.svg.png" alt="" />
                        <img className="w-[70px] bg-white py-2 px-6  rounded-[30px]" src="/public/LoginImg/Facebook_Logo_2023.png" alt="" />
                        <img className="w-[70px] bg-white py-2 px-6  rounded-[30px]" src="/public/LoginImg/747.png" alt="" />
                    </div>
                </div>
                <div>
                    <img src="/public/LoginImg/upscalemedia-transformed.png" alt="Sign up illustration" />
                </div>
            </div>
        </div>
    );
};

export default SignUp;
