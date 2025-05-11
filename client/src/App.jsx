import { useState } from 'react'
import Navbar from './Components/Navbar'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BookPage from './Pages/Books'
import IndividualBook from './Pages/IndividualBook'
import Home from './Home.jsx';
import LoginForm from './Pages/LoginForm.jsx'
import RegisterForm from './Pages/RegisterForm.jsx'

function App() {
  const [count, setCount] = useState(0)

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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
