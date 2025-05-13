import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Verify from './Pages/Verify';
import Home from './Home';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<BookPage />} />
        <Route path="/book/:bookId" element={<IndividualBook />} />
        <Route path="/announcements" element={<Announcement />} />
        <Route path="/account" element={<UserProfile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-summary" element={<OrderSummary />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
