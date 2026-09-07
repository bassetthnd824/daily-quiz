'use client'

import { Theme, useTheme } from '@/context/theme-context'
import { ChangeEvent } from 'react'
import classes from './ThemeSelector.module.scss'

const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme()

  const handleThemeChange = (event: ChangeEvent<HTMLInputElement>) => {
    changeTheme(event.target.value as Theme)
  }

  return (
    <div className={classes.themeSelector}>
      <p>Select your favorite theme</p>
      <label className={classes.themeLabel}>
        <input
          type="radio"
          name="theme"
          value="light"
          className={classes.themeRadio}
          checked={theme === 'light'}
          onChange={handleThemeChange}
        />
        Light
      </label>
      <label className={classes.themeLabel}>
        <input
          type="radio"
          name="theme"
          value="dark"
          className={classes.themeRadio}
          checked={theme === 'dark'}
          onChange={handleThemeChange}
        />
        Dark
      </label>
      <label className={classes.themeLabel}>
        <input
          type="radio"
          name="theme"
          value="bama"
          className={classes.themeRadio}
          checked={theme === 'bama'}
          onChange={handleThemeChange}
        />
        Roll Moon Controlled Water Level
      </label>
      <label className={classes.themeLabel}>
        <input
          type="radio"
          name="theme"
          value="barn"
          className={classes.themeRadio}
          checked={theme === 'barn'}
          onChange={handleThemeChange}
        />
        War Bird of Prey / American Symbol of Freedom
      </label>
    </div>
  )
}

export default ThemeSelector
