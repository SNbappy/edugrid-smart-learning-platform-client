// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const email = location.state?.email || '';
    const verifiedCode = location.state?.verifiedCode || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const validatePassword = (pwd) => {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
        return {
            minLength, hasUpper, hasLower, hasNumber, hasSpecial,
            isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
        };
    };
    const checks = validatePassword(password);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!checks.isValid) {
            toast.error('Password does not meet all requirements', {
                position: 'top-center',
                autoClose: 4000,
            });
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match', {
                position: 'top-center',
                autoClose: 3000,
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axiosPublic.post('/reset-password', {
                email,
                code: verifiedCode,
                password
            });
            if (response.data.success) {
                toast.success('Password reset successful! Please log in.', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                navigate('/login', {
                    replace: true,
                    state: {
                        resetEmail: email,
                        message: 'Password reset successful! Log in with your new password.'
                    }
                });
            } else {
                throw new Error(response.data.message || 'Reset failed');
            }
        } catch (error) {
            console.error('❌ Reset error response:', error.response?.data);
            const msg = error.response?.data?.message || error.message || 'Failed to reset password.';
            toast.error(msg, { position: 'top-center', autoClose: 5000 });
            if (/expired|invalid/i.test(msg)) {
                setTimeout(() => navigate('/forgot-password', { replace: true }), 3000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !verifiedCode) {
        return (
            <div className="min-h-screen bg-[#DCE8F5] flex items-center justify-center p-4">
                <Helmet><title>Reset Password | EduGrid</title></Helmet>
                <div className="text-center">
                    <p className="text-slate-700 text-sm sm:text-base mb-4">Invalid reset request</p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#457B9D] text-white text-sm sm:text-base rounded-lg hover:bg-[#3a6b8a] transition-colors"
                    >
                        Go to Forgot Password
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#DCE8F5] font-poppins min-h-screen text-black">
            <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
                <Helmet><title>EduGrid | Reset Password</title></Helmet>
                <div className="flex flex-col lg:flex-row justify-between items-center min-h-screen py-6 lg:py-0 gap-6 lg:gap-8">
                    {/* Form Section */}
                    <div className="bg-[#DCE8F5]/30 rounded-[20px] sm:rounded-[30px] shadow-2xl px-6 sm:px-10 lg:px-[70px] w-full lg:w-1/2 py-8 sm:py-12 lg:pt-[80px] lg:pb-[40px]">
                        <div className="text-center mb-6 sm:mb-8">
                            <p className="font-bold text-2xl sm:text-[28.5px] pb-2 sm:pb-3">Reset Your Password</p>
                            <p className="text-gray-600 text-xs sm:text-sm px-2">Enter your new password below</p>
                            <p className="text-[#457B9D] font-medium text-xs sm:text-sm mt-2 break-all px-2">{email}</p>
                        </div>

                        <form onSubmit={handleResetPassword}>
                            {/* New Password */}
                            <p className="font-medium text-xs sm:text-sm pb-1">New Password</p>
                            <div className="relative mb-5 sm:mb-6">
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-4 pr-12 w-full border border-gray-200 focus:border-[#457B9D] focus:outline-none transition-colors text-sm sm:text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {isPasswordVisible ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-3 sm:p-4 mb-5 sm:mb-6">
                                <p className="font-semibold text-xs sm:text-sm text-gray-700 mb-2">Password Requirements:</p>
                                <ul className="text-[10px] sm:text-xs space-y-1">
                                    <li className={checks.minLength ? 'text-green-600' : 'text-gray-600'}>
                                        {checks.minLength ? '✓' : '•'} At least 8 characters long
                                    </li>
                                    <li className={checks.hasUpper ? 'text-green-600' : 'text-gray-600'}>
                                        {checks.hasUpper ? '✓' : '•'} One uppercase letter (A-Z)
                                    </li>
                                    <li className={checks.hasLower ? 'text-green-600' : 'text-gray-600'}>
                                        {checks.hasLower ? '✓' : '•'} One lowercase letter (a-z)
                                    </li>
                                    <li className={checks.hasNumber ? 'text-green-600' : 'text-gray-600'}>
                                        {checks.hasNumber ? '✓' : '•'} One number (0-9)
                                    </li>
                                    <li className={checks.hasSpecial ? 'text-green-600' : 'text-gray-600'}>
                                        {checks.hasSpecial ? '✓' : '•'} One special character
                                    </li>
                                </ul>
                            </div>

                            {/* Confirm Password */}
                            <p className="font-medium text-xs sm:text-sm pb-1">Confirm Password</p>
                            <div className="relative mb-6 sm:mb-[30px]">
                                <input
                                    type={isConfirmVisible ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    className="bg-white rounded-[4px] py-2.5 sm:py-3 pl-4 pr-12 w-full border border-gray-200 focus:border-[#457B9D] focus:outline-none transition-colors text-sm sm:text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmVisible(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {isConfirmVisible ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                                </button>
                            </div>

                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-red-500 text-xs sm:text-sm mb-4 -mt-4">Passwords do not match</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || !checks.isValid || password !== confirmPassword}
                                className="w-full text-white bg-[#457B9D] py-3 sm:py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>

                        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs sm:text-sm text-blue-800">
                                <strong>Note:</strong> After resetting your password, you'll be redirected to the login page to sign in with your new credentials.
                            </p>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="hidden lg:block lg:w-1/2">
                        <img
                            src="LoginImg/upscalemedia-transformed.png"
                            alt="Reset password illustration"
                            className="w-full h-auto max-w-lg mx-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
