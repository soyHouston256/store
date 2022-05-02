import { useState } from 'react'
import Navbar from '@/components/Navbar'
import '@/assets/reset.css'
import '@/assets/variables.css'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
       <Navbar></Navbar>
    </div>
  )
}

export default App
