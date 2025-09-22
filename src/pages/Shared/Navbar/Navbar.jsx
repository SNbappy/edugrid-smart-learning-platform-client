// Navbar.js
import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';

const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className='bg-[#DCE8F5]'>
            <div className='flex justify-between max-w-[1300px] mx-auto items-center font-poppins pt-[26px] pb-[12px]'>
                <NavLink to="/" className='font-bold text-[43px]'>
                    <span className='text-[#003366] [-webkit-text-stroke:1px_black]'>Edu</span>
                    <span className='text-white [-webkit-text-stroke:1px_black]'>Grid</span>
                </NavLink>

                <div className='flex gap-8 font-medium text-[25px] items-center text-[#457B9D]'>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="about">About</NavLink>
                    <NavLink to="contact">Contact</NavLink>
                    {/* <NavLink to="blog">Blog</NavLink> */}
                    <NavLink to="all-classes">All Classes</NavLink>
                </div>

                <div className='flex font-medium text-[22px] font-dmsans gap-8 items-center'>
                    {user ? (
                        <>
                            <NavLink
                                to="dashboard"
                                className='px-[46px] py-[11px] rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors'
                            >
                                Dashboard
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className='px-[46px] py-[11px] rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 cursor-pointer hover:bg-[#3b37d1] transition-colors'
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="sign-up"
                                className='px-[46px] py-[11px] rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors'
                            >
                                Sign Up
                            </NavLink>
                            <NavLink
                                to="login"
                                className='px-[46px] py-[11px] rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 hover:bg-[#3b37d1] transition-colors'
                            >
                                Login
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
