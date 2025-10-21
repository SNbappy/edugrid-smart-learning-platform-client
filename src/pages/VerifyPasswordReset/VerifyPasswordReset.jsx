import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import './VerifyPasswordReset.css';

const VerifyPasswordReset = () => {
    const [hasError, setHasError] = useState(false);
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
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTimer = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const resetInputs = () => {
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-0')?.focus();
    };

    const handleChange = (index, value) => {
        if (value.length > 1 || !/^\d*$/.test(value)) return;
        if (hasError) setHasError(false);
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
            setCode(pastedData.split(''));
            document.getElementById('code-5')?.focus();
        }
    };

    const handleVerify = async () => {
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setHasError(true);
            resetInputs();
            setTimeout(() => setHasError(false), 400);
            toast.error('Please enter all 6 digits', { position: 'top-center', autoClose: 3000 });
            return;
        }
        setIsLoading(true);
        try {
            const response = await axiosPublic.post('/verify-password-reset-code', {
                email,
                code: verificationCode
            });
            if (response.data.success) {
                toast.success('Code verified! Set your new password.', { position: 'top-center', autoClose: 1500 });
                setTimeout(() => {
                    navigate('/reset-password', {
                        state: { email, verifiedCode: verificationCode },
                        replace: true
                    });
                }, 1500);
            } else {
                setHasError(true);
                resetInputs();
                setTimeout(() => setHasError(false), 400);
            }
        } catch {
            setHasError(true);
            resetInputs();
            setTimeout(() => setHasError(false), 400);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            const response = await axiosPublic.post('/send-password-reset-code', { email });
            if (response.data.success) {
                toast.success('New verification code sent to your email!', {
                    position: 'top-center',
                    autoClose: 3000,
                });
                resetInputs();
                setTimer(300);
            }
        } catch {
            toast.error('Could not send verification code. Please try again.', {
                position: 'top-center',
                autoClose: 5000,
            });
        } finally {
            setIsResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-[#DCE8F5] flex items-center justify-center p-4">
                <Helmet>
                    <title>Verify Password Reset | EduGrid</title>
                </Helmet>
                <div className="text-center">
                    <p className="text-slate-700 text-sm sm:text-base mb-4">No email provided</p>
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
        <div className="min-h-screen bg-[#DCE8F5] font-poppins flex items-center justify-center p-3 sm:p-4 md:p-6">
            <Helmet>
                <title>Verify Password Reset | EduGrid</title>
                <meta name="description" content="Enter your verification code to reset your EduGrid password." />
            </Helmet>
            <div className="w-full max-w-[90%] sm:max-w-md md:max-w-lg">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#457B9D] to-[#3a6b8a] rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg shadow-[#457B9D]/30">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
                        Enter Verification Code
                    </h1>
                    <p className="text-slate-600 text-xs sm:text-sm md:text-base px-2">
                        Enter the 6 digit code sent to your email to reset your password.
                    </p>
                    <p className="text-[#457B9D] font-medium text-xs sm:text-sm mt-2 break-all px-2">{email}</p>
                </div>
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
                            disabled={isLoading}
                            className={`w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold bg-white text-slate-900 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-all shadow-sm ${hasError ? 'input-error' : 'border-slate-300 focus:border-[#457B9D]'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleVerify}
                    disabled={isLoading || code.join('').length !== 6}
                    className="w-full bg-[#457B9D] hover:bg-[#3a6b8a] text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-5 sm:mb-6 shadow-md"
                >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <div className="text-center bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm">
                    <p className="text-slate-600 text-xs sm:text-sm mb-2">Didn't receive the code?</p>
                    {timer > 0 ? (
                        <div className="space-y-1">
                            <p className="text-[#457B9D] font-bold text-base sm:text-lg">{formatTimer()}</p>
                            <p className="text-slate-500 text-xs">Please wait before requesting a new code</p>
                        </div>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-[#457B9D] hover:text-[#3a6b8a] font-semibold text-sm sm:text-base disabled:opacity-50 underline transition-colors"
                        >
                            {isResending ? 'SENDING...' : 'RESEND CODE'}
                        </button>
                    )}
                </div>
                <div className="text-center mt-5 sm:mt-6">
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-slate-600 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors"
                    >
                        ← Back to Forgot Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyPasswordReset;
