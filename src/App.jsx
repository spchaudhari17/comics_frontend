import React from 'react';
import './App.scss';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

// Auth Pages
import { LogIn } from './pages/authentication/LogIn';
import { SignUp } from './pages/authentication/SignUp';
import { ForgotPassword } from './pages/authentication/ForgotPassword';

// Main Layout and Pages
import { Layout } from './components/layouts/Layout';
import { Home } from './pages/Home';
import { ComicSubmittedSuccessfully } from './pages/ComicSubmittedSuccessfully';
import { PageNotFound } from './pages/PageNotFound';
import OtpVerification from './pages/authentication/OtpVerification';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/OtpVerification" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Main Layout Routes */}
        <Route path="/" element={<Layout />}>
          {/* <Route index element={<Dashboard />} /> */}
          <Route path="home" element={<Home />} />
          <Route path="comic-successful" element={<ComicSubmittedSuccessfully />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
