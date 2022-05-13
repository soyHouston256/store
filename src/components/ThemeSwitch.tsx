import { useContext, useEffect, useState } from 'react'
import { Theme, ThemeContext } from './context/ThemeContext'
import styled from 'styled-components'
import '@/components/ThemeSwitch.scss'
import { motion } from 'framer-motion'
import clickSound from '@/assets/click.mp3'

const ButtonTheme = styled(motion.div)`
    border: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
  `

function ThemeSwitch () {
  const { theme, setTheme } = useContext(ThemeContext)
  const [isOpen, setIsOpen] = useState(false);

  const audio = new Audio(clickSound)

  const playClickSound = () => {
    audio.playbackRate = 1.5
    audio.play()
  };

  // FIXME: refactor this to use useEffect
  const toggleTheme = () => {
    if (theme === Theme.Light) setTheme(Theme.Dark)
    else setTheme(Theme.Light)
  }

  useEffect(() => {
    playClickSound()
    document.body.classList.remove('dark-theme')
    if (isOpen) document.body.classList.add('dark-theme')
  }, [isOpen]);

  return (
    <ButtonTheme>
      <motion.div
          layout
          data-isopen={isOpen}
          className="parent"
          onClick={() => setIsOpen(!isOpen)}
        >
        <motion.div layout className="child" />
        <motion.div layout className="tip" />
        <motion.div layout className="tip" />
        <motion.div layout className="tip" />
        <motion.div layout className="tip" />
        <motion.div layout className="tip" />
        <motion.div layout className="tip" />
      </motion.div>
    </ButtonTheme>
  )
}

export default ThemeSwitch