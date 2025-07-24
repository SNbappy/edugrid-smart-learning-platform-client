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
import PrivateRoute from "./PrivateRoute";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Dashboard from "../pages/Dashboard/Dashboard/Dashboard";
import EditProfile from "../pages/EditProfile/EditProfile";
import CreateClass from "../pages/CreateClass/CreateClass";
import MyClasses from "../pages/MyClasses/MyClasses";
import MaterialsPage from "../pages/Classroom/MaterialsPage";
import AttendancePage from "../pages/Classroom/AttendancePage";
import Classroom from "../pages/Classroom/Classroom";
import TasksPage from "../pages/Classroom/TasksPage";
import MarksPage from "../pages/Classroom/MarksPage";

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
            {
                path: 'forgot-password',
                element: <ForgotPassword/>
            }
        ]
    },
    {
        path: '/dashboard',
        element: <PrivateRoute><Dashboard /></PrivateRoute>
    },
    {
        path: '/edit-profile',
        element: <PrivateRoute><EditProfile /></PrivateRoute>
    },
    {
        path: '/create-class',
        element: <PrivateRoute><CreateClass/></PrivateRoute>
    },
    {
        path: '/my-classes',
        element: <PrivateRoute><MyClasses/></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId',
        element: <PrivateRoute><Classroom /></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId/attendance',
        element: <PrivateRoute><AttendancePage /></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId/materials',
        element: <PrivateRoute><MaterialsPage /></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId/tasks',
        element: <PrivateRoute><TasksPage /></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId/marks',
        element: <PrivateRoute><MarksPage /></PrivateRoute>
    }
]);