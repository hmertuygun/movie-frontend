import React, { useContext } from 'react'
import GaugeChart from 'react-gauge-chart'
import { stableCoins } from '../../constants/StableCoinsList'
import { PortfolioContext } from '../context/PortfolioContext'
import { ThemeContext } from '../../contexts/ThemeContext'

const CashoMeter = () => {
  const { balance } = useContext(PortfolioContext)
  const { theme } = useContext(ThemeContext)

  let coins = stableCoins
    .map((coin) =>
      balance ? balance.filter((item) => item.SYMBOL === coin) : []
    )
    .flat()
  let totalValue =
    balance && balance.reduce((acc, value) => acc + Number(value.USD), 0)

  let totalStableCoins =
    coins && coins.reduce((acc, value) => acc + Number(value.USD), 0)

  let percentageCalculation =
    Math.abs((Number(totalStableCoins) * 100) / totalValue) / 100

  let resultPercentage = Number(percentageCalculation.toFixed(3))

  let colors =
    theme === 'LIGHT'
      ? ['#5cc9a7', '#ffbe3d', '#f25767']
      : ['#82d6bc', '#ffcf70', '#f68692']

  let textColor = theme === 'LIGHT' ? '#718096' : '#a2aab5'

  const style = {
    height: 121.05
  }

  return (
    <>
      {!isNaN(resultPercentage) ? (
        <GaugeChart
          id="gauge-chart1"
          nrOfLevels={20}
          percent={resultPercentage}
          textColor={textColor}
          animate={false}
          arcPadding={0.03}
          arcsLength={[0.1, 0.5, 0.4]}
          colors={colors}
          className="gauge-chart"
          style={style}
        />
      ) : null}
    </>
  )
}

export default CashoMeter
