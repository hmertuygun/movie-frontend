import React, { useMemo, useState, useEffect } from 'react'
import { stableCoins } from 'constants/StableCoinsList'
import './CashoMeter.css'
import { useSelector } from 'react-redux'

const CashoMeter = () => {
  const [bars, setBars] = useState([])
  const { balance } = useSelector((state) => state.portfolio)

  useEffect(() => {
    let data = [...new Array(50)].map((value, index) => ({ id: index + 1 }))
    setBars(data)
  }, [])

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

  let finalPercent = Math.ceil(value / 2)

  return (
    <>
      {!isNaN(resultPercentage) ? (
        <div className="d-flex align-items-center bars-container">
          {bars.map((bar) => (
            <span
              className={`${
                bar.id <= 10
                  ? 'bg-success'
                  : bar.id <= 28
                  ? 'bg-yellow'
                  : 'bg-danger'
              } bar ${finalPercent === bar.id ? 'marked-value' : ''}`}
            >
              {finalPercent === bar.id ? (
                <span className="percentage">{value}%</span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </>
  )
}

export default CashoMeter
