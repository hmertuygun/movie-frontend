import React, { createContext, useState, useEffect } from 'react'
export const ThemeContext = createContext()

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'LIGHT')

  useEffect(() => {
    if (theme === 'LIGHT') {
      localStorage.setItem('theme', 'LIGHT')
    } else if (theme === 'DARK') {
      localStorage.setItem('theme', 'DARK')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
