import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'

const ExitStoploss = () => {
  const { state, addStoploss } = useContext(TradeContext)
  const { entry } = state
  const [triggerPrice, setTriggerPrice] = useState(entry.price)
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
  const [amount, setAmount] = useState('')
  const [amountPercentage, setAmountPercentage] = useState('')
  const [isValid, setIsValid] = useState(false)

  // TODO update depending on how many steps are in fulltrade
  useEffect(() => {
    console.log()
    if (triggerPrice && price && amount) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [triggerPrice, price, amount])

  const priceAndProfitSync = (inputChanged, value) => {
    switch (inputChanged) {
      case 'triggerPrice':
        return false

      case 'price':
        const diff = entry.price - value
        const percentage = roundNumbers((diff / entry.price) * 100, 2)
        setProfit(-percentage)
        return false

      case 'profit':
        // check if negative
        const newPrice = entry.price * (-value / 100)
        setPrice(entry.price - newPrice)
        return false

      case 'amount':
        if (value <= entry.amount) {
          setAmountPercentage(roundNumbers((value / entry.amount) * 100, 4))
        }
        return false

      case 'amountPercentage':
        const theAmount = (entry.amount * value) / 100
        setAmount(roundNumbers(theAmount, 6))
        return false

      default: {
        console.error('WARNING')
      }
    }
  }

  return (
    <TabNavigator labelArray={['Stop-limit', 'Stop-market']} index={0}>
      <section style={{ marginTop: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()

            addStoploss({
              price,
              triggerPrice,
              amount,
            })
          }}
        >
          <InlineInput
            label="Trigger price"
            type="number"
            placeholder="Trigger price"
            value={triggerPrice}
            onChange={(value) => {
              setTriggerPrice(value)
              priceAndProfitSync('triggerPrice', value)
            }}
            postLabel="USDT"
          />

          <InlineInput
            label="Price"
            type="number"
            placeholder="price"
            onChange={(value) => {
              setPrice(value)
              priceAndProfitSync('price', value)
            }}
            value={price}
            postLabel="USDT"
          />

          <InlineInput
            label="Profit"
            type="number"
            placeholder=""
            onBlur={(event) => {
              const value = event.target.value
              if (value < 0) {
                setProfit(value)
              } else {
                setProfit(-value)
              }
            }}
            onChange={(value) => {
              if (value < 0) {
                setProfit(value)
              } else {
                setProfit(-value)
              }
              priceAndProfitSync('profit', value)
            }}
            value={profit}
            postLabel="%"
          />

          <InlineInput
            label="Amount"
            type="number"
            onChange={(value) => {
              setAmount(value)
              priceAndProfitSync('amount', value)
            }}
            value={amount}
            postLabel="BTC"
          />

          <InlineInput
            label=""
            value={amountPercentage}
            onChange={(value) => {
              setAmountPercentage(value)
              priceAndProfitSync('amountPercentage', value)
            }}
            type="number"
            min={-100}
            max={100}
            placeholder=""
            postLabel="%"
          />

          <Button
            type="submit"
            disabled={isValid ? null : 'disabled'}
            variant="sell"
          >
            Add Stop-loss
          </Button>
        </form>
      </section>
      <div style={{ marginTop: '2rem' }}>
        <Typography as="h3">Not available yet</Typography>
      </div>
    </TabNavigator>
  )
}

export default ExitStoploss
