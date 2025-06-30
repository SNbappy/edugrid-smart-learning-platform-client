import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <div className='bg-[#DCE8F5]'>
            <div className='flex justify-between max-w-[1300px] mx-auto items-center font-poppins pt-[26px] pb-[12px]'>
                <NavLink to="/" className='font-bold text-[43px]'>
                    <span className='text-[#003366] [-webkit-text-stroke:1px_black]'>Edu</span><span className='text-white [-webkit-text-stroke:1px_black]'>Grid</span>
                </NavLink>
                <div className='flex gap-8 font-medium text-[25px] items-center text-[#457B9D]'>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="about">About</NavLink>
                    <NavLink to="contact">Contact</NavLink>
                    <NavLink to="blog">Blog</NavLink>
                    <NavLink to="all-classes">All Classes</NavLink>
                </div>
                <div className='flex font-medium text-[22px] font-dmsans gap-8 items-center'>
                    <NavLink to="sign-up" className=' px-[46px] py-[11px] rounded-[30px] border-[#423FE5] border-2 text-[#423FE5]'>Sign Up</NavLink>
                    <NavLink to="login" className='px-[46px] py-[11px] rounded-[30px] text-white bg-[#423FE5] border-[#423FE5] border-2'>Login</NavLink>
                </div>
            </div>
       </div>
    );
};

export default Navbar;