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
// import MaterialsPage from "../pages/Classroom/MaterialsPage";
import AttendancePage from "../pages/Classroom/AttendancePage";
import Classroom from "../pages/Classroom/Classroom";
import TasksPage from "../pages/Classroom/Tasks/TasksPage";
import MarksPage from "../pages/Classroom/MarksPage";
import MaterialsPage from "../pages/Classroom/MaterialsPage";
import PublicRoute from "./PublicRoute";
import ClassroomRoute from "../pages/Classroom/ClassroomRoute";
import PublicProfile from "../pages/Dashboard/Dashboard/PublicProfile";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import CompleteProfile from "../pages/CompleteProfile/CompleteProfile";
import VerifyPasswordReset from "../pages/VerifyPasswordReset/VerifyPasswordReset";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

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
            // {
            //     path: 'blog',
            //     element: <Blog/>
            // },
            {
                path: 'all-classes',
                element: <AllClasses />
            },
            {
                path: 'sign-up',
                element: <PublicRoute><SignUp /></PublicRoute>
            },
            {
                path: 'login',
                element: <PublicRoute><Login /></PublicRoute>
            },
            {
                path: 'forgot-password',
                element: <PublicRoute><ForgotPassword /></PublicRoute>
            },
            {
                path: 'verify-email',
                element: <VerifyEmail />
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
        path: '/user/:email',
        element: <PrivateRoute><PublicProfile /></PrivateRoute>
    },
    {
        path: '/classroom/:classroomId',
        element: <ClassroomRoute><Classroom /></ClassroomRoute>
    },
    {
        path: '/classroom/:classroomId/attendance',
        element: <ClassroomRoute><AttendancePage /></ClassroomRoute>
    },
    {
        path: '/classroom/:classroomId/materials',
        element: <ClassroomRoute><MaterialsPage /></ClassroomRoute>
    },
    {
        path: '/classroom/:classroomId/tasks',
        element: <ClassroomRoute><TasksPage /></ClassroomRoute>
    },
    {
        path: '/classroom/:classroomId/marks',
        element: <ClassroomRoute><MarksPage /></ClassroomRoute>
    },
    {
        path: '/complete-profile',
        element: <CompleteProfile/>
    },
    {
        path: '/verify-password-reset',
        element: <VerifyPasswordReset/>
    },
    {
        path: '/reset-password',
        element: <ResetPassword/>
    },
]);