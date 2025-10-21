import { useContext, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../providers/AuthProvider';
import useAxiosPublic from '../../hooks/useAxiosPublic';


const CompleteProfile = () => {
    const { user, updateUserProfile, logOut } = useContext(AuthContext);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // ✅ Prevent navigation away from this page
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Please complete your profile before leaving.';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);
        // console.log('Completing profile with:', data.name);

        try {
            // ✅ Update Firebase profile with formatted name and NO PHOTO
            await updateUserProfile(data.name, "");
            // console.log('✅ Firebase profile updated with formatted name (no photo)');

            // ✅ Create user in database with formatted name and NO PHOTO
            const userInfo = {
                name: data.name,
                email: user.email,
                photoURL: "", // ✅ Empty string - no Google photo
                loginMethod: 'google',
                createdAt: new Date(),
                role: 'user',
                emailVerified: true,
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

            // console.log('Saving user to database:', userInfo);
            const res = await axiosPublic.post('/users', userInfo);
            // console.log('Backend response:', res.data);

            if (res.data.insertedId || res.data.message === 'User created successfully') {
                // console.log('✅ User successfully saved to database without photo');

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Profile Completed Successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1500);
            }
        } catch (error) {
            console.error('❌ Profile completion error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Profile Setup Failed!',
                text: 'Failed to complete your profile. Please try again.',
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle sign out
    const handleSignOut = async () => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Cancel Profile Setup?',
            text: 'You need to complete your profile to use EduGrid. Do you want to sign out?',
            showCancelButton: true,
            confirmButtonText: 'Yes, Sign Out',
            cancelButtonText: 'Continue Setup',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#457B9D'
        });

        if (result.isConfirmed) {
            await logOut();
            navigate('/login', { replace: true });
        }
    };

    // Redirect if no user
    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="bg-[#DCE8F5] font-poppins text-black min-h-screen">
            <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
                <Helmet>
                    <title>Complete Profile | EduGrid</title>
                    <meta name="description" content="Complete your EduGrid profile with Student ID and name." />
                </Helmet>

                <div className="flex items-center justify-center min-h-screen py-6 lg:py-8">
                    <div className="bg-[#DCE8F5]/30 rounded-[20px] lg:rounded-[30px] shadow-2xl px-6 sm:px-10 md:px-16 lg:px-[70px] w-full max-w-2xl py-8 sm:py-12 lg:py-16">
                        {/* User Info Display - WITHOUT PHOTO */}
                        <div className="text-center mb-8">
                            {/* ✅ Generic user icon instead of Google photo */}
                            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] rounded-full mx-auto mb-4 shadow-lg">
                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <p className="text-slate-600 text-sm sm:text-base mb-2">Signed in as</p>
                            <p className="text-[#457B9D] font-semibold text-base sm:text-lg break-all px-2">{user.email}</p>
                        </div>

                        {/* Required Badge */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 mb-6">
                            <p className="text-red-700 text-sm sm:text-base font-semibold text-center">
                                ⚠️ Profile completion is required to access EduGrid
                            </p>
                        </div>

                        <h2 className="font-bold text-2xl sm:text-[26px] lg:text-[28.5px] pb-4 lg:pb-5 text-center">
                            Complete Your Profile
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base text-center mb-6">
                            Please enter your Student ID and Name to continue
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <p className="font-medium text-xs sm:text-sm pb-1">Enter Student ID and Name</p>
                            <input
                                type="text"
                                {...register('name', {
                                    required: 'Student ID and name are required',
                                    pattern: {
                                        value: /^\d{6}\s-\s.+$/,
                                        message: 'Format must be: 6-digit ID - Name (e.g., 200109 - Md. Sabbir Hossain Bappy)'
                                    }
                                })}
                                placeholder="200109 - Md. Sabbir Hossain Bappy"
                                className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-3 sm:pl-4 w-full mb-5 sm:mb-[30px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
                                autoFocus
                            />
                            {errors.name && (
                                <span className="text-red-500 text-xs sm:text-sm block mt-[-16px] sm:mt-[-25px] mb-4 sm:mb-5">
                                    {errors.name.message}
                                </span>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 sm:p-4 mb-5 sm:mb-6">
                                <p className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">Name Format:</p>
                                <ul className="text-[10px] sm:text-xs text-gray-600 space-y-1">
                                    <li>• Start with your 6-digit Student ID</li>
                                    <li>• Add a space, hyphen, and space ( - )</li>
                                    <li>• Then write your full name</li>
                                    <li>• Example: 200109 - Md. Sabbir Hossain Bappy</li>
                                </ul>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-3 sm:py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base mb-4"
                            >
                                {isLoading ? 'Saving Profile...' : 'Complete Profile & Continue'}
                            </button>

                            {/* Sign Out Option */}
                            <button
                                type="button"
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="w-full text-red-600 bg-white border-2 border-red-200 py-3 sm:py-4 rounded-[4px] hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                            >
                                Cancel & Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CompleteProfile;
