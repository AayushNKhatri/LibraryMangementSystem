import { useState } from 'react'
import Navbar from './Components/Navbar'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookPage from './Pages/Books'
import IndividualBook from './Pages/IndividualBook'
import Home from './Home.jsx';
import LoginForm from './Pages/LoginForm.jsx'
import RegisterForm from './Pages/RegisterForm.jsx'
import Announcement from './Pages/Announcement.jsx'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './Pages/Admin';
import UserProfile from './Pages/UserProfile';
import Cart from './Pages/Cart';
import OrderSummary from './Pages/OrderSummary';
import Verify from './Pages/Verify';
import './App.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<BookPage />} />
          <Route path="/book/:bookId" element={<IndividualBook />} />
          <Route path='/login' element={<LoginForm />}/>
          <Route path="/register" element={<RegisterForm />}/>
          <Route path="/announcements" element={<Announcement />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
    <Router>
      <div className="app">
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/account" element={<UserProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-summary" element={<OrderSummary />} />
          <Route path="/verify" element={<Verify />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
