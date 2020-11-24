import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'

const ExitTarget = () => {
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
  const [amount, setAmount] = useState('')
  const [amountPercentage, setAmountPercentage] = useState('')
  const [isValid, setIsValid] = useState(false)

  const { addTarget, state } = useContext(TradeContext)
  // ingoing value
  const { entry } = state

  useEffect(() => {
    setPrice(entry.price)
  }, [entry])

  // VALIDATE FORM
  useEffect(() => {
    if (price !== entry.price && price && amount <= entry.amount) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [price, amount, entry.amount, entry.price])

  // PRICE and PROFIT Sync
  const priceAndProfitSync = (inputChanged, value) => {
    if (inputChanged === 'price' && value > entry.price) {
      // set profit %
      const diff = value - entry.price
      setProfit(roundNumbers((diff / entry.price) * 100, 2))
    }

    if (inputChanged === 'profit') {
      setPrice(entry.price * (1 + value / 100))
    }

    if (inputChanged === 'amount' && value <= entry.amount) {
      setAmountPercentage(roundNumbers((value / entry.amount) * 100, 4))
    }

    if ((inputChanged === 'amountPercentage' && value < 101) || value > 0) {
      const theAmount = (entry.amount * value) / 100
      setAmount(roundNumbers(theAmount, 6))
    }

    return false
  }

  return (
    <TabNavigator labelArray={['Limit', 'Stop-market']}>
      <section style={{ marginTop: '2rem' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()

            addTarget({
              price,
              amount,
            })
          }}
        >
          <InlineInput
            label="Price"
            type="number"
            onChange={(value) => {
              setPrice(value)
              priceAndProfitSync('price', value)
            }}
            value={price}
            placeholder="Target price"
            postLabel="USDT"
          />

          <InlineInput
            label="Profit"
            type="number"
            onChange={(value) => {
              setProfit(value)
              priceAndProfitSync('profit', value)
            }}
            value={profit}
            postLabel="%"
          />

          <InlineInput
            label="Amount"
            type="number"
            onChange={(value) => {
              priceAndProfitSync('amount', value)
              setAmount(value)
            }}
            value={amount}
            postLabel="BTC"
          />

          <InlineInput
            label=""
            type="number"
            onChange={(value) => {
              setAmountPercentage(value)
              priceAndProfitSync('amountPercentage', value)
            }}
            value={amountPercentage}
            postLabel="%"
          />

          <Button
            disabled={isValid ? false : 'disabled'}
            variant="buy"
            type="submit"
          >
            Add Target
          </Button>
        </form>
      </section>
      <Typography as="h3">Not available yet.</Typography>
    </TabNavigator>
  )
}

export default ExitTarget
