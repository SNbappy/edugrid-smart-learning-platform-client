import { useContext, useState } from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const { resetPassword } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleResetPassword = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const form = event.target;
        const emailValue = form.email.value;

        if (!emailValue) {
            Swal.fire({
                icon: 'error',
                title: 'Email Required!',
                text: 'Please enter your email address.',
                confirmButtonColor: '#457B9D'
            });
            setIsLoading(false);
            return;
        }

        try {
            await resetPassword(emailValue);

            Swal.fire({
                icon: 'success',
                title: 'Reset Email Sent!',
                html: `
                    <p>A password reset link has been sent to <strong>${emailValue}</strong></p>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                        <strong>Note:</strong> Check your spam folder if you don't see the email within 5 minutes.
                    </p>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#457B9D'
            });

            form.reset();
            setEmail('');

        } catch (error) {
            console.error('Password reset error:', error);

            let errorMessage = 'Failed to send reset email. Please try again.';

            if (error.message === 'auth/user-not-found' || error.code === 'auth/user-not-found') {
                errorMessage = 'This email address is not registered with EduGrid. Please sign up first or check your email address.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many reset requests. Please try again later.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Reset Failed!',
                text: errorMessage,
                confirmButtonColor: '#457B9D'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#DCE8F5] font-poppins min-h-screen text-black">
            <div className="max-w-[1250px] mx-auto">
                <Helmet>
                    <title>EduGrid | Forgot Password</title>
                </Helmet>

                <div className="flex justify-between items-center min-h-screen">
                    <div className="bg-[#DCE8F5]/30 rounded-[30px] shadow-2xl px-[70px] w-1/2 pt-[80px] pb-[40px] mb-[63px] mt-[30px]">
                        <div className="text-center mb-8">
                            <p className="font-bold text-[28.5px] pb-3">Forgot Password?</p>
                            <p className="text-gray-600 text-sm">
                                Enter your registered email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleResetPassword}>
                            <p className="font-medium text-sm pb-1">Enter Your Email Address</p>
                            <input
                                type="email"
                                name="email"
                                placeholder="username@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white rounded-[4px] py-3 pl-4 w-full mb-[30px] border border-gray-200 focus:border-[#457B9D] focus:outline-none transition-colors"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full text-white bg-[#457B9D] py-4 rounded-[4px] hover:bg-[#3a6b8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isLoading ? 'Checking & Sending...' : 'Send Reset Email'}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-4">
                            <div className="flex items-center justify-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-[#457B9D] hover:underline font-medium text-sm flex items-center"
                                >
                                    ← Back to Login
                                </Link>
                                <span className="text-gray-400">|</span>
                                <Link
                                    to="/sign-up"
                                    className="text-[#457B9D] hover:underline font-medium text-sm"
                                >
                                    Create New Account
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-sm text-blue-800 mb-2">How it works:</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• We verify your email is registered with EduGrid</li>
                                <li>• Only registered users receive reset emails</li>
                                <li>• Check your spam folder if you don't see the email</li>
                                <li>• Reset link expires in 1 hour</li>
                                <li>• Contact support if you continue having issues</li>
                            </ul>
                        </div>

                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs text-green-800">
                                <strong>🛡️ Secure:</strong> We verify your email registration before sending reset instructions.
                            </p>
                        </div>
                    </div>

                    <div className="w-1/2">
                        <img
                            src="LoginImg/upscalemedia-transformed.png"
                            alt="Forgot password illustration"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
