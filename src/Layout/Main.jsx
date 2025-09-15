import { Outlet } from "react-router-dom"
import Footer from "../pages/Shared/Footer/Footer";
import Navbar from "../pages/Shared/Navbar/Navbar";

const Main = () => {
    // const location = useLocation();
    // console.log(location);
    // const noFooter = location.pathname.includes('login') || location.pathname.includes('sign-up')

    return (
        <div>
            <Navbar></Navbar>
            <Outlet></Outlet>
            <Footer />
        </div>
    );
};

export default Main;
