import React, { createContext, useState } from 'react'

export const TabContext = createContext()

const TabContextProvider = ({ children }) => {
  const [isTradePanelOpen, setIsTradePanelOpen] = useState(false)

  return (
    <TabContext.Provider value={{ isTradePanelOpen, setIsTradePanelOpen }}>
      {children}
    </TabContext.Provider>
  )
}

export default TabContextProvider
