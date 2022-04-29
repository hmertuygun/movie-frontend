import React, { createContext, useState, useEffect } from 'react'
import { storage } from 'services/storages'
export const ThemeContext = createContext()

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(storage.get('theme') || 'LIGHT')

  useEffect(() => {
    if (theme === 'LIGHT') {
      storage.set('theme', 'LIGHT')
    } else if (theme === 'DARK') {
      storage.set('theme', 'DARK')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
