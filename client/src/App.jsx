import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './Components/Navbar';
import LoginForm from './Pages/LoginForm';
import RegisterForm from './Pages/RegisterForm';
import Admin from './Pages/Admin';
import HomePage from './Pages/HomePage';
import NotFound from './Pages/NotFound';
import BookPage from './Pages/Books';
import IndividualBook from './Pages/IndividualBook';
import Announcement from './Pages/Announcement';
import UserProfile from './Pages/UserProfile';
import Cart from './Pages/Cart';
import OrderSummary from './Pages/OrderSummary';
import OrderConfirmation from './Pages/OrderConfirmation';
import Verify from './Pages/Verify';
import FilteredBooks from './Pages/FilteredBooks';
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import Home from './Home';
import './App.css';

// Import route protection components
import {
  AdminRoute,
  AdminRestrictedRoute,
  AuthenticatedRoute,
  PublicRoute,
  GuestOnlyRoute
} from './utils/ProtectedRoutes';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        {/* Guest-only routes - redirect to home/admin if logged in */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Public routes - accessible to everyone */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookPage />} />
          <Route path="/filtered-books" element={<FilteredBooks />} />
          <Route path="/book/:bookId" element={<IndividualBook />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/*" element={<Admin />} />
        </Route>

        {/* Authenticated user routes - redirect to login if not logged in */}
        <Route element={<AuthenticatedRoute />}>
          {/* Routes that admins should not access - redirect to admin panel */}
          <Route element={<AdminRestrictedRoute />}>
            <Route path="/announcements" element={<Announcement />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
