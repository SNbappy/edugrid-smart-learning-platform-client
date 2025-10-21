// Navbar.js
import { NavLink } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../../providers/AuthProvider';

const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logOut();
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className='bg-[#DCE8F5]'>
            <div className='max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 font-poppins'>
                <div className='flex justify-between items-center pt-4 pb-3 md:pt-[26px] md:pb-[12px]'>
                    {/* Logo */}
                    <NavLink to="/" className='font-bold text-2xl sm:text-3xl md:text-[43px] z-50 flex justify-center gap-2'>
                        <img src="/photo_2025-07-25_14-57-55.jpg" alt="" className='w-7 h-7 md:w-12 md:h-12' />
                        <div><span className='text-[#003366] [-webkit-text-stroke:0.5px_black] md:[-webkit-text-stroke:1px_black]'>Edu</span>
                            <span className='text-white [-webkit-text-stroke:0.5px_black] md:[-webkit-text-stroke:1px_black]'>Grid</span><sup><span className='text-xs font-semibold lg:text-lg text-blue-800'>beta</span></sup></div>
                    </NavLink>

                    {/* Desktop Navigation Links */}
                    <div className='hidden lg:flex gap-4 xl:gap-8 font-medium text-lg xl:text-[25px] items-center text-[#457B9D]'>
                        <NavLink to="/" className='hover:text-[#003366] transition-colors'>Home</NavLink>
                        <NavLink to="about" className='hover:text-[#003366] transition-colors'>About</NavLink>
                        <NavLink to="contact" className='hover:text-[#003366] transition-colors'>Contact</NavLink>
                        <NavLink to="all-classes" className='hover:text-[#003366] transition-colors'>All Classes</NavLink>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className='hidden lg:flex font-medium text-base xl:text-[22px] font-dmsans gap-4 xl:gap-8 items-center'>
                        {user ? (
                            <>
                                <NavLink
                                    to="dashboard"
                                    className='px-6 xl:px-[46px] py-2 xl:py-[11px] rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors'
                                >
                                    Dashboard
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className='px-6 xl:px-[46px] py-2 xl:py-[11px] rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 cursor-pointer hover:bg-[#3b37d1] transition-colors'
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="sign-up"
                                    className='px-6 xl:px-[46px] py-2 xl:py-[11px] rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors'
                                >
                                    Sign Up
                                </NavLink>
                                <NavLink
                                    to="login"
                                    className='px-6 xl:px-[46px] py-2 xl:py-[11px] rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 hover:bg-[#3b37d1] transition-colors'
                                >
                                    Login
                                </NavLink>
                            </>
                        )}
                    </div>

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className='lg:hidden z-50 p-2 text-[#457B9D] hover:text-[#003366] focus:outline-none transition-colors'
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-7 h-7 sm:w-8 sm:h-8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className='flex flex-col pb-4 space-y-3 font-poppins'>
                        {/* Mobile Navigation Links */}
                        <NavLink
                            to="/"
                            onClick={closeMenu}
                            className='text-[#457B9D] hover:text-[#003366] hover:bg-white/50 px-4 py-3 rounded-lg transition-all text-lg font-medium'
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="about"
                            onClick={closeMenu}
                            className='text-[#457B9D] hover:text-[#003366] hover:bg-white/50 px-4 py-3 rounded-lg transition-all text-lg font-medium'
                        >
                            About
                        </NavLink>
                        <NavLink
                            to="contact"
                            onClick={closeMenu}
                            className='text-[#457B9D] hover:text-[#003366] hover:bg-white/50 px-4 py-3 rounded-lg transition-all text-lg font-medium'
                        >
                            Contact
                        </NavLink>
                        <NavLink
                            to="all-classes"
                            onClick={closeMenu}
                            className='text-[#457B9D] hover:text-[#003366] hover:bg-white/50 px-4 py-3 rounded-lg transition-all text-lg font-medium'
                        >
                            All Classes
                        </NavLink>

                        {/* Mobile Auth Buttons */}
                        <div className='flex flex-col space-y-3 pt-2 font-dmsans'>
                            {user ? (
                                <>
                                    <NavLink
                                        to="dashboard"
                                        onClick={closeMenu}
                                        className='px-6 py-3 rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors text-center text-lg font-medium'
                                    >
                                        Dashboard
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className='px-6 py-3 rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 cursor-pointer hover:bg-[#3b37d1] transition-colors text-lg font-medium'
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink
                                        to="sign-up"
                                        onClick={closeMenu}
                                        className='px-6 py-3 rounded-[30px] border-[#423FE5] border-2 text-[#423FE5] hover:bg-[#423FE5] hover:text-white transition-colors text-center text-lg font-medium'
                                    >
                                        Sign Up
                                    </NavLink>
                                    <NavLink
                                        to="login"
                                        onClick={closeMenu}
                                        className='px-6 py-3 rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2 hover:bg-[#3b37d1] transition-colors text-center text-lg font-medium'
                                    >
                                        Login
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
