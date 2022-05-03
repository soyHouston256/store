import { useContext, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Theme, ThemeContext } from './context/ThemeContext'
import styled from 'styled-components'
import '@/components/test.scss'
function ThemeSwitch () {
  const { theme, setTheme } = useContext(ThemeContext)

  const toggleTheme = () => {
    if (theme === Theme.Light) setTheme(Theme.Dark)
    else setTheme(Theme.Light)
  }

  useEffect(() => {
    document.body.classList.remove('dark-theme')
    if (theme === Theme.Dark) document.body.classList.add('dark-theme')
  }, [theme]);

  const ButtonTheme = styled.button`
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    svg {
      fill: 'var(--color-text)',
      width: '32px',
      height: '32px'
    }
  }`

  const [isOpen, setIsOpen] = useState(false);

  return (
    <ButtonTheme
      onClick={toggleTheme}
      >
      { theme === Theme.Light ?
          <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M196 128a68 68 0 1 1-68-68a68.1 68.1 0 0 1 68 68Zm-68-84a8 8 0 0 0 8-8v-8a8 8 0 0 0-16 0v8a8 8 0 0 0 8 8ZM57.3 68.6a8.1 8.1 0 0 0 11.3 0a8 8 0 0 0 0-11.3l-5.7-5.7a8 8 0 0 0-11.3 11.3ZM36 120h-8a8 8 0 0 0 0 16h8a8 8 0 0 0 0-16Zm21.3 67.4l-5.7 5.7a8 8 0 0 0 0 11.3a8.3 8.3 0 0 0 5.7 2.3a8 8 0 0 0 5.6-2.3l5.7-5.7a8 8 0 0 0-11.3-11.3ZM128 212a8 8 0 0 0-8 8v8a8 8 0 0 0 16 0v-8a8 8 0 0 0-8-8Zm70.7-24.6a8 8 0 0 0-11.3 11.3l5.7 5.7a8 8 0 0 0 5.6 2.3a8.3 8.3 0 0 0 5.7-2.3a8 8 0 0 0 0-11.3ZM228 120h-8a8 8 0 0 0 0 16h8a8 8 0 0 0 0-16Zm-34.9-49.1a7.8 7.8 0 0 0 5.6-2.3l5.7-5.7a8 8 0 1 0-11.3-11.3l-5.7 5.7a8 8 0 0 0 0 11.3a7.8 7.8 0 0 0 5.7 2.3Z"></path></svg>
          : <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M224.3 154.9A100 100 0 1 1 101 31.7a7.9 7.9 0 0 1 10.3 8.1a5.7 5.7 0 0 1-.3 1.8A84 84 0 0 0 214.3 145l2.2-.4a8.1 8.1 0 0 1 7.8 5.7a7.2 7.2 0 0 1 0 4.6Z"></path></svg>
      }
    </ButtonTheme>
  )
}

export default ThemeSwitch