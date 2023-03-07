import { useEffect } from 'react'
import styled from 'styled-components'
import '@/components/ThemeSwitch.scss'
import { motion } from 'framer-motion'
import clickSound from '@/assets/click.mp3'
import { useDarkMode } from 'usehooks-ts'

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

function ThemeSwitch(): JSX.Element {
  const { isDarkMode, toggle } = useDarkMode()

  const audio = new Audio(clickSound)

  const playClickSound = () => {
    audio.playbackRate = 1.5
    audio.play()
  };

  useEffect(() => {
    playClickSound()
    document.body.classList.remove('dark-theme')
    if (isDarkMode) document.body.classList.add('dark-theme')
  }, [isDarkMode]);

  return (
    <ButtonTheme>
      <motion.div
          layout
          data-isopen={isDarkMode}
          className="parent"
          onClick={toggle}
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