import {
    createBrowserRouter,
} from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../pages/Home/Home/Home";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Blog from "../pages/Blog/Blog";
import AllClasses from "../pages/AllClasses/AllClasses";
import SignUp from "../pages/SignUp/SignUp";
import Login from "../pages/Login/Login";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        children: [
            {
                path: '/',
                element: <Home></Home>
            },
            {
                path: 'about',
                element: <About/>
            },
            {
                path: 'contact',
                element: <Contact/>
            },
            {
                path: 'blog',
                element: <Blog/>
            },
            {
                path: 'all-classes',
                element: <AllClasses/>
            },
            {
                path: 'sign-up',
                element: <SignUp/>
            },
            {
                path: 'login',
                element: <Login/>
            },
        ]
    },
]);