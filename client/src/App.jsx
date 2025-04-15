import { useState } from 'react'
import viteLogo from '/vite.svg'
import Home from './Home'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Home/>
      <h1> Hello i am  bernard </h1>
    </>
  )
}

export default App
