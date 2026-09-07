'use client'

import { THEMES, useTheme } from '@/context/theme-context'
import classes from './ThemeSelector.module.scss'

const ThemeSelector = () => {
  const { theme, changeTheme } = useTheme()

  return (
    <fieldset className={classes.themeSelector}>
      <legend className={classes.legend}>Select your favorite theme</legend>
      <div className={classes.options}>
        {THEMES.map(({ id, label }) => (
          <label key={id} className={`btn ${classes.themeLabel}`}>
            <input
              type="radio"
              name="theme"
              value={id}
              className={classes.visuallyHidden}
              checked={theme === id}
              onChange={() => changeTheme(id)}
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default ThemeSelector
