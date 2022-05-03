import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import '@/assets/reset.css'
import '@/App.css'
import { ThemeContext, Theme } from '@/components/context/ThemeContext'
import { GlobalStyles } from '@/Theme'

function App() {
  const [theme, setTheme] = useState(Theme.Light);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GlobalStyles />
      <div className="App">
        <Navbar />
      </div>
    </ThemeContext.Provider>
  )
}

export default App
