import { useContext} from 'react';
import { AuthContext } from '../../providers/AuthProvider';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Swal from 'sweetalert2';

const Login = () => {
    const { signIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = event => {
        event.preventDefault();
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;
        console.log(email, password);
        signIn(email, password)
            .then(result => {
                const user = result.user;
                console.log(user);
                Swal.fire({
                    title: "User Login Successful",
                    showClass: {
                        popup: `
                            animate__animated
                            animate__fadeInUp
                            animate__faster
                        `
                    },
                    hideClass: {
                        popup: `
                            animate__animated
                            animate__fadeOutDown
                            animate__faster
                        `
                    }
                });
                navigate(from, { replace: true });
            })
    }

    return (
        <div className="bg-[#DCE8F5]">
            <Helmet>EduGrid | Sign Up</Helmet>

            <div>
                <div className="bg-[#DCE8F5]/30 rounded-[30px] shadow-2xl px-[70px] w-fit pt-[80px] pb-[40px] ml-[63px] ">
                    <p className="font-bold text-[28.5px] pb-5">Create a new account</p>
                    <p className="font-medium text-sm pb-1">Enter an Email Address</p>
                    <input type="email" name="email" placeholder="username@gmail.com" id="" className="bg-white rounded-[4px] py-3 pl-4 w-full mb-7" />
                    <p className="font-medium text-sm pb-1">Enter Password</p>
                    <input type="password" name="Password" placeholder="Password" id="" className="bg-white rounded-[4px] py-3 pl-4 w-full mb-7" />
                    <p className="font-medium text-sm pb-1">Confirm Password</p>
                    <input type="password" name="Password" placeholder="Password" id="" className="bg-white rounded-[4px] py-3 pl-4 w-full mb-7" />
                    <button className="w-full text-white bg-[#457B9D] py-4 rounded-[4px]">Sign up</button>
                    <p className="text-sm py-[30px] text-center font-medium">or continue with</p>
                    {/* icon google, facebook and apple */}
                </div>
                <div>

                </div>
            </div>
        </div>
    );
};

export default Login;
