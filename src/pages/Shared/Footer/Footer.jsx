import { IoLocationOutline } from "react-icons/io5";
import { IoMailOutline } from "react-icons/io5";
import { IoCallSharp } from "react-icons/io5";
import { FaInfoCircle, FaCalendarAlt, FaUsers, FaEnvelope } from "react-icons/fa";

const Footer = () => {

    const links = [
        { name: "About Us", icon: <FaInfoCircle />, href: "/about" },
        { name: "All Classes", icon: <FaCalendarAlt />, href: "/all-classes" },
        { name: "Join Us", icon: <FaUsers />, href: "/sign-up" },
        { name: "Contact", icon: <FaEnvelope />, href: "/contact" },
    ];

    return (
        <footer className="pt-16 pb-6 text-white bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="container grid grid-cols-1 gap-12 px-6 mx-auto lg:w-10/12 md:grid-cols-2 xl:grid-cols-4">
                {/* About the Club */}
                <div>
                    <h2 className="mb-4 font-sans text-[22px] font-extrabold uppercase">EduGrid</h2>
                    <p className="leading-relaxed text-gray-300 text-[16px] lg:text-lg">
                        EduGrid is a modern educational platform designed to simplify learning and academic management through intuitive design, dynamic features, and seamless user experience.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="mb-4 font-sans text-[22px] font-bold uppercase">Quick Links</h3>
                    <ul className="space-y-3 text-gray-300 text-[16px] lg:text-lg">
                        {links.map((link, index) => (
                            <li key={index}>
                                <a
                                    href={link.href}
                                    className="flex items-center transition-all duration-300 ease-in-out hover:text-blue-400"
                                >
                                    <span className="mr-2">{link.icon}</span> {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="mb-4 font-sans text-2xl font-bold uppercase text-[22px]">Contact Us</h3>
                    <p className="flex items-center gap-2 text-gray-300 text-[16px] lg:text-lg hover:text-blue-400">
                        <IoLocationOutline className="font-bold" />Main Branch:<br />EduGrid Office, MM Hall 119
                    </p>
                    <p className="flex items-center gap-2 text-gray-300 text-[16px] lg:text-lg hover:text-blue-400">
                        <IoLocationOutline className="font-bold" />MR Hall Branch: <br />EduGrid Office, MR Hall 407
                    </p>
                    <p className="flex items-center gap-2 text-gray-300 text-[16px] lg:text-lg py-2 hover:text-blue-400">
                        <IoMailOutline />
                        <a href="mailto:ceo@edugrid.com" className="flex items-center gap-2">
                            ceo@edugrid.com
                        </a>
                    </p>
                    <p className="flex items-center gap-2 text-gray-300 text-[16px] lg:text-lg hover:text-blue-400">
                        <IoCallSharp />
                        <a href="tel:+8801921024590" className="transition-all duration-300">
                            +88 01921-024590
                        </a>
                    </p>
                    <div className="flex mt-4 space-x-4">
                        {["facebook", "x icon", "youtube", "instagram"].map((icon, index) => (
                            <img key={index} className="w-[20px] h-[20px] hover:scale-110 transition-transform" src={`FooterIcon/${icon}.png`} alt={icon} />
                        ))}
                    </div>
                </div>

                {/* Direct Mail Section */}
                <div>
                    <h3 className="mb-4 font-sans text-[22px] font-bold uppercase">Send Us a Message</h3>
                    <form action="mailto:ceo@edugrid.com" method="post" encType="text/plain" className="space-y-3">
                        <input type="text" placeholder="Your Name" className="w-full p-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-[14px] border-white border" required />
                        <input type="email" placeholder="Your Email" className="w-full p-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-[14px] border-white border" required />
                        <textarea placeholder="Your Message" className="w-full p-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-[14px] border-white border" rows="3" required></textarea>
                        <button type="submit" className="w-full p-2 font-bold text-white transition-all duration-300 bg-[#003366] rounded-md hover:bg-blue-600 text-[14px]">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 mt-12 text-center text-gray-500 border-t border-gray-700 text-[14px]">
                <p>© {new Date().getFullYear()} EduGrid Smart Learning Platform. All Rights Reserved.</p>
                {/* <p className="mt-2">
                    Developed by <a href="https://its-bappy.netlify.app" className="font-bold text-blue-400 animate-pulse" target="_blank" rel="noopener noreferrer">Bappy</a>
                </p> */}
            </div>
        </footer>
    );
};

export default Footer;