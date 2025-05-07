import { useState } from 'react'
import viteLogo from '/vite.svg'
import Home from './Home'
import './App.css'
import Books from './Pages/Books'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Books/>
    </>
  )
}

export default App
