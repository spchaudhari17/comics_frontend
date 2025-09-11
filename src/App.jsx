import React from 'react';
import './App.scss';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import ToastContainers from './lib/ToastContainer';

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

function App() {
  return (
    <>
      <BrowserRouter>
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
            <Route path="super-admin" element={<SuperAdmin />} />
            <Route path="my-comics" element={<MyComics />} />
            <Route path="create-comic" element={<ComicGenerator />} />
            <Route path="comic-successful" element={<ComicSubmittedSuccessfully />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainers />
    </>
  );
}

export default App;
