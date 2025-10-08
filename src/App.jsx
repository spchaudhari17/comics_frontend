import React, { useEffect } from "react";

// AOS Animation NPM
import AOS from "aos";
import "aos/dist/aos.css";
import './App.scss';

import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ToastContainers from './lib/ToastContainer';

// Scroll To Top 
import ScrollToTop from "./components/ScrollToTop";

// Auth Pages
import { LogIn } from './pages/authentication/LogIn';
import { SignUp } from './pages/authentication/SignUp';
import { ForgotPassword } from './pages/authentication/ForgotPassword';

// Main Layout and Pages
import { Layout } from './components/layouts/Layout';
import { Home } from './pages/Homepage/Home';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { ComicSubmittedSuccessfully } from './pages/ComicSubmittedSuccessfully';
import { PageNotFound } from './pages/PageNotFound';
import OtpVerification from './pages/authentication/OtpVerification';
import { SuperAdmin } from './pages/admin/SuperAdmin';
import MyComics from './pages/mycomics/MyComics';
import ComicGenerator from './pages/ComicGenerator/ComicGenerator';
import ParentActivity from './pages/parentsPages/ParentActivity';
import Privacy from './pages/PrivacyPolicy/Privacy';
import TermsAndCondition from './pages/TermsCondition/TermsAndCondition';
import ComicsList from './pages/ComicsList/ComicsList';
import ParentsLanding from './pages/Homepage/Parent/ParentsLanding';
import StudentLanding from './pages/Homepage/Student/StudentLanding';
import TeacherLanding from './pages/Homepage/Teacher/TeacherLanding';
import FAQLanding from './pages/Homepage/Faq/FAQLanding';
import AllUsers from './pages/admin/AllUsers';
import ContactList from './pages/admin/ContactList';
import AdminComicDetails from "./pages/admin/AdminComicDetails";
import MyComicsDetails from "./pages/mycomics/MyComicsDetails";


function App() {
  // AOS Animations
  useEffect(() => {
    AOS.init({
      offset: 120,
      duration: 800,
      easing: 'ease-in-out',
      once: true
    }); // set options as needed
  }, []);

  return (
    <>
      <BrowserRouter>
        {/* When redirect to any page, page should load from top */}
        <ScrollToTop />

        <Routes>
          {/* Auth Routes */}
          {/* Redirect root to /login */}
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/OtpVerification" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Super Admin Route */}

          {/* Main Layout Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="for-teacher" element={<TeacherLanding />} />
            <Route path="for-student" element={<StudentLanding />} />
            <Route path="for-parent" element={<ParentsLanding />} />
            <Route path="faq" element={<FAQLanding />} />
            <Route path="our-library" element={<ComicsList />} />

            <Route path="super-admin" element={<SuperAdmin />} />
            <Route path="allUsers" element={<AllUsers />} />
            <Route path="comic-details/:id" element={<AdminComicDetails />} />



            <Route path="my-comics" element={<MyComics />} />
            <Route path="create-comic" element={<ComicGenerator />} />
            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="terms-and-condition" element={<TermsAndCondition />} />
            <Route path="comic-successful" element={<ComicSubmittedSuccessfully />} />
            <Route path="contactList" element={<ContactList />} />
            <Route path="ParentActivity" element={<ParentActivity />} />
            <Route path="my-comics-details/:id" element={<MyComicsDetails />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainers />
    </>
  );
}

export default App;
