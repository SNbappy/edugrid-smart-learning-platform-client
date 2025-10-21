import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { AuthContext } from '../../providers/AuthProvider';


const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();
    const { logOut } = useContext(AuthContext);

    const email = location.state?.email || '';
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes

    // ✅ Logout user when component mounts to prevent dashboard access
    useEffect(() => {
        const handleLogout = async () => {
            try {
                await logOut();
                // console.log('✅ User logged out on verify-email page');
            } catch (error) {
                console.error('Logout error:', error);
            }
        };

        if (email) {
            handleLogout();
        }
    }, [logOut, email]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            document.getElementById(`code-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            document.getElementById(`code-${index - 1}`)?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();

        if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
            const newCode = pastedData.split('');
            setCode(newCode);
            document.getElementById('code-5')?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');

        if (verificationCode.length !== 6) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Code',
                text: 'Please enter all 6 digits',
                confirmButtonColor: '#457B9D'
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await axiosPublic.post('/verify-code', {
                email: email,
                code: verificationCode
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Email Verified!',
                    text: 'Your email has been verified successfully. You can now log in.',
                    confirmButtonColor: '#457B9D'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (error) {
            console.error('Verification error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: error.response?.data?.message || 'Invalid or expired code. Please try again.',
                confirmButtonColor: '#457B9D'
            });
            setCode(['', '', '', '', '', '']);
            document.getElementById('code-0')?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);

        try {
            const response = await axiosPublic.post('/send-verification-code', { email });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Code Sent!',
                    text: 'A new verification code has been sent to your email.',
                    confirmButtonColor: '#457B9D'
                });

                // console.log('🔑 Verification code:', response.data.code);

                setCode(['', '', '', '', '', '']);
                setTimer(300);
                document.getElementById('code-0')?.focus();
            }
        } catch (error) {
            console.error('Resend error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Resend',
                text: 'Could not send verification code. Please try again.',
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-[#DCE8F5] flex items-center justify-center p-4">
                <Helmet>
                    <title>Verify Email | EduGrid</title>
                </Helmet>
                <div className="text-center">
                    <p className="text-slate-700 text-sm sm:text-base mb-4">No email provided</p>
                    <button
                        onClick={() => navigate('/sign-up')}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#457B9D] text-white text-sm sm:text-base rounded-lg hover:bg-[#3a6b8a] transition-colors"
                    >
                        Go to Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DCE8F5] font-poppins flex items-center justify-center p-3 sm:p-4 md:p-6">
            <Helmet>
                <title>Verify Email | EduGrid</title>
                <meta name="description" content="Verify your email address to complete your EduGrid account registration." />
            </Helmet>

            <div className="w-full max-w-[90%] sm:max-w-md md:max-w-lg">
                {/* Icon */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-[#457B9D]/30">
                        <div className="relative">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#457B9D] rounded flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white">
                                ✉
                            </div>
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">Enter Your OTP</h1>
                    <p className="text-slate-600 text-xs sm:text-sm md:text-base px-2">
                        Enter the 6 digit code that you received on your email.
                    </p>
                    <p className="text-[#457B9D] font-medium text-xs sm:text-sm mt-2 break-all px-2">
                        {email}
                    </p>
                </div>

                {/* Code Input - Responsive sizing */}
                <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            id={`code-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold bg-white text-slate-900 border-2 border-slate-300 rounded-lg sm:rounded-xl focus:border-[#457B9D] focus:outline-none transition-all shadow-sm"
                            disabled={isLoading}
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isLoading || code.join('').length !== 6}
                    className="w-full bg-[#457B9D] hover:bg-[#3a6b8a] text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5 sm:mb-6 shadow-md"
                >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                </button>

                {/* Resend Section */}
                <div className="text-center bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm">
                    <p className="text-slate-600 text-xs sm:text-sm mb-2">Didn't receive the code?</p>
                    {timer > 0 ? (
                        <div className="space-y-1">
                            <p className="text-[#457B9D] font-bold text-base sm:text-lg">
                                {formatTimer()}
                            </p>
                            <p className="text-slate-500 text-xs">Please wait before requesting a new code</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-[#457B9D] hover:text-[#3a6b8a] font-semibold text-sm sm:text-base disabled:opacity-50 underline transition-colors"
                        >
                            {isResending ? 'SENDING...' : 'RESEND OTP'}
                        </button>
                    )}
                </div>

                {/* Back to Login Link */}
                <div className="text-center mt-5 sm:mt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};


export default VerifyEmail;
