import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPublic = useAxiosPublic();

    const email = location.state?.email || '';
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes

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

                console.log('🔑 Verification code:', response.data.code);

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
                <div className="text-center">
                    <p className="text-slate-700 mb-4">No email provided</p>
                    <button
                        onClick={() => navigate('/sign-up')}
                        className="px-6 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#3a6b8a]"
                    >
                        Go to Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#DCE8F5] font-poppins flex items-center justify-center p-4">
            <Helmet>
                <title>Verify Email | EduGrid</title>
            </Helmet>

            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] rounded-2xl mb-6 shadow-lg shadow-[#457B9D]/30">
                        <div className="relative">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#457B9D] rounded flex items-center justify-center text-[10px] font-bold text-white">
                                ✦ ✦ ✦
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-3">Enter Your OTP</h1>
                    <p className="text-slate-600 text-sm">
                        Enter the 6 digit code that you received on your email.
                    </p>
                </div>

                {/* Code Input */}
                <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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
                            className="w-14 h-16 text-center text-2xl font-bold bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:border-[#457B9D] focus:outline-none transition-all shadow-sm"
                            disabled={isLoading}
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isLoading || code.join('').length !== 6}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 border-2 border-slate-300 shadow-sm"
                >
                    {isLoading ? 'Verifying...' : 'Verify'}
                </button>

                {/* Resend Section */}
                <div className="text-center">
                    <p className="text-slate-600 text-sm mb-2">Not receive a code?</p>
                    {timer > 0 ? (
                        <p className="text-[#457B9D] font-semibold text-sm">
                            RESEND OTP IN {formatTimer()}
                        </p>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-[#457B9D] hover:text-[#3a6b8a] font-semibold text-sm disabled:opacity-50 underline"
                        >
                            {isResending ? 'SENDING...' : 'RESEND OTP'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
