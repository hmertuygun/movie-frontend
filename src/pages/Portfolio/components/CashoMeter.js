import React, { useContext, useMemo } from 'react'
import GaugeChart from 'react-gauge-chart'
import { stableCoins } from 'constants/StableCoinsList'
import { PortfolioContext } from 'contexts/PortfolioContext'
import { ThemeContext } from 'contexts/ThemeContext'
import './CashoMeter.css'

const CashoMeter = () => {
  const { balance } = useContext(PortfolioContext)
  const { theme } = useContext(ThemeContext)

  let coins = useMemo(
    () =>
      stableCoins
        .map((coin) =>
          balance ? balance.filter((item) => item.SYMBOL === coin) : []
        )
        .flat(),
    [balance]
  )

  let totalValue = useMemo(
    () => balance && balance.reduce((acc, value) => acc + Number(value.USD), 0),
    [balance]
  )

  let totalStableCoins = useMemo(
    () => coins && coins.reduce((acc, value) => acc + Number(value.USD), 0),
    [coins]
  )

  let percentageCalculation = useMemo(
    () => Math.abs((Number(totalStableCoins) * 100) / totalValue) / 100,
    [totalStableCoins, totalValue]
  )

  let resultPercentage = useMemo(
    () => Number(percentageCalculation.toFixed(3)),
    [percentageCalculation]
  )

  let value = useMemo(
    () => (resultPercentage * 100).toFixed(1),
    [resultPercentage]
  )

  let colors = useMemo(
    () =>
      theme === 'LIGHT'
        ? ['#5cc9a7', '#ffbe3d', '#f25767']
        : ['#82d6bc', '#ffcf70', '#f68692'],
    [theme]
  )

  let textColor = useMemo(
    () => (theme === 'LIGHT' ? '#718096' : '#a2aab5'),
    [theme]
  )

  const style = {
    height: 121.05,
    width: '92%',
  }

  return (
    <>
      {!isNaN(resultPercentage) ? (
        <>
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
            hideText={true}
          />
          <p className="text-muted text-sm font-weight-bold text-center value-mobile mt-2">
            {value}%
          </p>
        </>
      ) : null}
    </>
  )
}

export default CashoMeter
