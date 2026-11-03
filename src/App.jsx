import React, { useEffect } from "react";
import AnalyticsTracker from "./components/AnalyticsTracker";

// AOS Animation NPM
import AOS from "aos";
import "aos/dist/aos.css";
import './App.scss';

import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { isUserLoggedIn, saveReturnAfterLogin } from "./utility/authRedirect";
import ExternalRedirect from "./components/ExternalRedirect";
import { SHOP_PAGES } from "./utility/shopLinks";
import ToastContainers from './lib/ToastContainer';

// Scroll To Top 
import ScrollToTop from "./components/ScrollToTop";

// Auth Pages
import { LogIn } from './pages/authentication/LogIn';
import { SignUp } from './pages/authentication/SignUp';
import { ForgotPassword } from './pages/authentication/ForgotPassword';

// Main Layout and Pages
import { Layout } from './components/layouts/Layout';
import { ContactUs } from './pages/ContactUs';
import { ComicSubmittedSuccessfully } from './pages/ComicSubmittedSuccessfully';
import { PageNotFound } from './pages/PageNotFound';
import OtpVerification from './pages/authentication/OtpVerification';
import { SuperAdmin } from './pages/admin/SuperAdmin';
import MyComics from './pages/mycomics/MyComics';
import ComicGenerator from './pages/ComicGenerator/ComicGenerator';
import ParentActivity from './pages/ParentActivity/ParentActivity';
import Privacy from './pages/PrivacyPolicy/Privacy';
import TermsAndCondition from './pages/TermsCondition/TermsAndCondition';
import ComicsList from './pages/ComicsList/ComicsList';
import FAQLanding from './pages/Homepage/Faq/FAQLanding';
import AllUsers from './pages/admin/AllUsers';
import ContactList from './pages/admin/ContactList';
import AdminComicDetails from "./pages/admin/AdminComicDetails";
import MyComicsDetails from "./pages/mycomics/MyComicsDetails";
import SubjectList from "./pages/admin/SubjectList";
import InstituteDashboard from "./pages/InstituteDashboard/InstituteDashboard";
import ParentManageChildren from "./pages/ParentActivity/ParentManageChildren";
import ChangePassword from "./pages/authentication/ChangePassword";
import ProfileDetails from "./pages/authentication/ProfileDetails";
import ComicRevenueReport from "./pages/admin/ComicRevenueReport";
import AdUnitManager from "./pages/admin/AdUnitManager";
import SubscriptionPlans from "./pages/subscriptions/SubscriptionPlans";
import SubscriptionSuccess from "./pages/subscriptions/SubscriptionSuccess";
import MyAccount from "./pages/MyAccount/MyAccount";
import SubscriptionRules from "./pages/subscriptions/SubscriptionRules";
import MarketPlace from "./pages/MarketPlace/MarketPlace";
import MymarketList from "./pages/MarketPlace/MymarketList";
import MarketPlaceDetails from "./pages/MarketPlace/MarketPlaceDetails";
import AddToCart from "./pages/MarketPlace/AddToCart";
import CartSuccess from "./pages/MarketPlace/CartSuccess";
import CancelPage from "./pages/MarketPlace/CancelPage";
import PurchasedBundleDetails from "./pages/MyAccount/PurchasedBundleDetails";
import ComicReader from "./pages/MyAccount/ComicReader";
import CouponPage from "./pages/coupon/Coupon";
import Offers from "./pages/coupon/Offers";
import CouponHeadlinePage from "./pages/coupon/CouponHeadline";
import TeacherDashboard from "./pages/MyAccount/TeacherDashboard";
import FoundingTeacherSuccess from "./pages/subscriptions/FoundingTeacherSuccess";
import CreditsPaymentResult from "./pages/ComicGenerator/CreditsPaymentResult";


// Login zaroori wale pages: logout user -> /login, login ke baad wapas isi page pe
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isUserLoggedIn()) {
    saveReturnAfterLogin(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
        <AnalyticsTracker />
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

          {/* Main Layout Routes */}
          <Route path="/" element={<Layout />}>
            {/* Marketing pages ab shop.kridemy.com pe (utility/shopLinks.js) */}
            <Route index element={<ExternalRedirect to={SHOP_PAGES.home} />} />
            <Route path="about" element={<ExternalRedirect to={SHOP_PAGES.about} />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="for-teacher" element={<ExternalRedirect to={SHOP_PAGES.forTeachers} />} />
            <Route path="for-student" element={<ExternalRedirect to={SHOP_PAGES.studentsParents} />} />
            <Route path="for-parent" element={<ExternalRedirect to={SHOP_PAGES.studentsParents} />} />
            <Route path="faq" element={<FAQLanding />} />
            <Route path="our-library" element={<ComicsList />} />
            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="terms-and-condition" element={<TermsAndCondition />} />
            <Route path="coupon-offers" element={<Offers />} />

            <Route path="/subscriptions-plan" element={<SubscriptionPlans />} />
            <Route path="/success" element={<SubscriptionSuccess />} />
            <Route path="/payment-success" element={<CartSuccess />} />
            <Route path="/founding-teacher-success" element={<FoundingTeacherSuccess />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            <Route path="/subscription-rules" element={<SubscriptionRules />} />

            <Route path="/market-place" element={<MarketPlace />} />
            <Route path="/marketPlaceDetails/:id" element={<MarketPlaceDetails />} />
            <Route path="/purchasedBundleDetails/:id" element={<ProtectedRoute><PurchasedBundleDetails /></ProtectedRoute>} />
            <Route path="/comic-reader/:comicId" element={<ProtectedRoute><ComicReader /></ProtectedRoute>} />
            <Route path="/mybundleList" element={<ProtectedRoute><MymarketList /></ProtectedRoute>} />
            <Route path="/cart" element={<AddToCart />} />
            <Route path="/teacherDashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />

            {/* protected routes  */}

            {/* <Route path="super-admin" element={<SuperAdmin />} /> */}
            <Route path="super-admin" element={<ProtectedRoute> <SuperAdmin />  </ProtectedRoute>} />

            <Route path="Coupon" element={<ProtectedRoute> <CouponPage />  </ProtectedRoute>} />
            <Route path="coupon-headline" element={<ProtectedRoute> <CouponHeadlinePage />  </ProtectedRoute>} />

            {/* <Route path="allUsers" element={<AllUsers />} /> */}
            <Route path="allUsers" element={<ProtectedRoute><AllUsers /></ProtectedRoute>} />

            {/* <Route path="comic-details/:id" element={<AdminComicDetails />} /> */}
            <Route path="comic-details/:id" element={<ProtectedRoute>    <AdminComicDetails /></ProtectedRoute>} />

            {/* <Route path="subjectlist" element={<SubjectList />} /> */}
            <Route path="subjectlist" element={<ProtectedRoute>  <SubjectList /> </ProtectedRoute>} />

            {/* <Route path="adUnitManager" element={<AdUnitManager />} /> */}
            <Route path="adUnitManager" element={<ProtectedRoute> <AdUnitManager /> </ProtectedRoute>} />

            {/* <Route path="comic-revenue-report" element={<ComicRevenueReport />} /> */}
            <Route path="comic-revenue-report" element={<ProtectedRoute>  <ComicRevenueReport /> </ProtectedRoute>} />

            {/* <Route path="contactList" element={<ContactList />} /> */}
            <Route path="contactList" element={<ProtectedRoute><ContactList /></ProtectedRoute>} />


            {/* <Route path="institute-dashboard" element={<InstituteDashboard />} /> */}
            <Route path="institute-dashboard" element={<ProtectedRoute><InstituteDashboard /></ProtectedRoute>} />

            {/* <Route path="changepassword" element={<ChangePassword />} /> */}
            <Route path="changepassword" element={<ProtectedRoute> <ChangePassword /> </ProtectedRoute>} />

            {/* <Route path="my-profile" element={<ProfileDetails />} /> */}
            <Route path="my-profile" element={<ProtectedRoute> <ProfileDetails /> </ProtectedRoute>} />

            {/* <Route path="my-comics" element={<MyComics />} /> */}
            <Route path="my-comics" element={<ProtectedRoute>  <MyComics /></ProtectedRoute>} />

            {/* <Route path="create-comic" element={<ComicGenerator />} /> */}
            <Route path="create-comic" element={<ProtectedRoute><ComicGenerator /></ProtectedRoute>} />

            {/* <Route path="comic-successful" element={<ComicSubmittedSuccessfully />} /> */}
            <Route path="comic-successful" element={<ProtectedRoute><ComicSubmittedSuccessfully /></ProtectedRoute>} />

            {/* <Route path="/parent/manage-children" element={<ParentManageChildren />} /> */}
            <Route path="parent/manage-children" element={<ProtectedRoute><ParentManageChildren /></ProtectedRoute>} />

            {/* <Route path="/activity/:childId" element={<ParentActivity />} /> */}
            <Route path="activity/:childId" element={<ProtectedRoute> <ParentActivity /> </ProtectedRoute>} />

            {/* <Route path="my-comics-details/:id" element={<MyComicsDetails />} /> */}
            <Route path="my-comics-details/:id" element={<ProtectedRoute> <MyComicsDetails /> </ProtectedRoute>} />
            <Route path="/credits/payment-result" element={<CreditsPaymentResult />} />

            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <ToastContainers />
    </>
  );
}

export default App;
