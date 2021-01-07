import React from 'react'
import PortfolioCTXProvider from '../Portfolio/context/PortfolioContext'
import PortfolioContainer from '../Portfolio/PortfolioContainer'

const PortfolioView = () => (
  <PortfolioCTXProvider>
    <PortfolioContainer />
  </PortfolioCTXProvider>
)

export default PortfolioView
