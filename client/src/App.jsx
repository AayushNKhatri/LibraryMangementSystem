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
