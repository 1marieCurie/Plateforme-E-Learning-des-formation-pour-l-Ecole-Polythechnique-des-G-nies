import FormationsBrowserPage from "@/pages/Etudiant/FormationsBrowser";
import {createBrowserRouter, Navigate} from "react-router-dom";

import Register from "../pages/Register";
import Login from "../pages/Login";
import Users from "../pages/Users";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import ContactUs from "../pages/ContactUs";
import About from "../pages/About";
import FormationPublique from "@/pages/FormationPublique";
import PrivateRoute from "./PrivateRoute"; 


import Layout from "../Layouts/Layout";
import MainLayout from "../Layouts/MainLayout";

import Dashboard from "../pages/Dashboard"; 
import Web_Formation from "../pages/Formations/Web_Dev";
import Mobile_Formation from "../pages/Formations/Mobile_Dev";

//Etudiant
import StudentLayout from "../Layouts/StudentLayout";
import StudentDashboard from "../pages/StudentDashboard";
import CoursSuivis from "@/pages/Etudiant/CoursSuivis";
import Statistics from "@/pages/Etudiant/Statistics";

import Profile from "@/pages/Etudiant/Profile";
// import Devoirs from "@/pages/Etudiant/Devoirs"; (supprimé)

//Formateur
import TeacherLayout from "@/Layouts/TeacherLayout";
import TeacherDashboard from "../pages/TeacherDashboard";
import MesCours from "../pages/Professeur/MesCours";
import Etudiants from "../pages/Professeur/Etudiants";
import Chapitres from "../pages/Professeur/Chapitres";
import Evaluation from "../pages/Professeur/Evaluation";
import Formations from "@/pages/Professeur/Formations";
import Profile_Teacher from "@/pages/Professeur/Profile_Teacher";

//Admin 
import AdminLayout from "@/Layouts/AdminLayout";
import AdminDashboard from "../pages/AdminDashboard";
import ManageUsers from "@/pages/Admin/ManageUsers";
import Profile_Admin from "@/pages/Admin/Profile_Admin";
import Permissions from "@/pages/Admin/Permissions";
import Stats_Tech from "@/pages/Admin/Stats_Tech";


import {
  LOGIN_ROUTE,
  REGISTER_ROUTE,
  USERS_ROUTE,
  DASHBOARD_ROUTE,
  WEB_FORMATION_ROUTE,
  MOBILE_FORMATION_ROUTE,
  UNAUTHORIZED_ROUTE,
 
} from "./paths"; // ou "../router/paths"



export const router = createBrowserRouter([

// Toutes les routes utilisent MainLayout (avec Navigation et Footer)
  {
    element: <MainLayout />,
    children: [
      {
        index: true, 
        element: <Dashboard />,
      },
      {
        path: DASHBOARD_ROUTE,
        element: <Dashboard />,
      },
      {
        path: WEB_FORMATION_ROUTE,
        element: <Web_Formation />,
      },
      {
        path: MOBILE_FORMATION_ROUTE,
        element: <Mobile_Formation />,
      },
      {
        path: LOGIN_ROUTE,
        element: <Login/>
      },
      {
        path: REGISTER_ROUTE,
        element: <Register/>
      },
      {
        path :'/formationPublique',
        element : <FormationPublique />
      },
      {
        path: "/contact",
        element: <ContactUs />
      },
      {
        path : "/about",
        element : <About/>
      },
      {
        path: "/candidature",
        element: <Navigate to="/register" replace />
      },
      {
        path: UNAUTHORIZED_ROUTE,
        element: <Unauthorized />
      },
      {
        path: USERS_ROUTE,
        element: <Users/>
      },
      {
        path: '*',
        element: <NotFound/>
      },
    ],
  },
   
    {
      element: <PrivateRoute allowedRoles={["etudiant"]} />,
      children: [
        {
          path: "/student",
          element: <StudentLayout />,
          children: [
            { path: "", element: <StudentDashboard /> },
            { path: "cours_suivis", element: <CoursSuivis /> },
            { path: "statistics", element: <Statistics /> },
            { path: "profile", element: <Profile /> },
            // { path: "devoirs", element: <Devoirs /> }, (supprimé)
            { path: "formations", element: <FormationsBrowserPage /> },
          ],
        },
      ],
    },

    {
      element: <PrivateRoute allowedRoles={["formateur"]} />,
      children: [
        {
          path: "/teacher",
          element: <TeacherLayout />,
          children: [
            { path: "", element: <TeacherDashboard /> },
            { path: "mes_cours", element: <MesCours /> },
            { path: "chapitres", element: <Chapitres /> },
            { path: "étudiants", element: <Etudiants /> },
            { path: "évaluation", element: <Evaluation /> },
            { path: "formations", element: <Formations /> },
            { path : "profile", element: <Profile_Teacher />}, 
          ],
        },
      ],
    },
    {
  element: <PrivateRoute allowedRoles={["admin", "super_admin"]} />,
  children: [
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
  { path: "", element: <AdminDashboard /> },
  { path: "dashboard", element: <AdminDashboard /> },
        { path: "users", element: <ManageUsers /> },
        { path: "profile", element: <Profile_Admin /> },
        { path: "stats_tech", element: <Stats_Tech /> },
        { path: "permissions", element: <Permissions /> },
      ],
    },
  ],
},


    

]);

