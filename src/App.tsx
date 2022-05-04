import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import '@/assets/reset.css'
import '@/App.css'
import { ThemeContext, Theme } from '@/components/context/ThemeContext'
import { GlobalStyles } from '@/Theme'
import Hero from '@/components/Hero'

function App() {
  const [theme, setTheme] = useState(Theme.Light);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GlobalStyles />
      <div className="App">
        <Navbar />
        <Hero />
      </div>
    </ThemeContext.Provider>
  )
}

export default App
