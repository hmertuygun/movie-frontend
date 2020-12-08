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
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [isValid, setIsValid] = useState(false)

  useEffect(
    () => {
      if (triggerPrice && price && quantity) {
        setIsValid(true)
      } else {
        setIsValid(false)
      }
    },
    [triggerPrice, price, quantity, entry.quantity],
    () => {}
  )

  const priceAndProfitSync = (inputChanged, value) => {
    switch (inputChanged) {
      case 'triggerPrice':
        return true

      case 'price':
        const diff = entry.price - value
        const percentage = roundNumbers((diff / entry.price) * 100, 2)
        setProfit(-percentage)
        return true

      case 'profit':
        // check if negative
        const newPrice = entry.price * (-value / 100)
        setPrice(entry.price - newPrice)
        return false

      case 'quantity':
        if (value <= entry.quantity) {
          setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 4))
        }
        return false

      case 'quantityPercentage':
        const theQuantity = (entry.quantity * value) / 100
        setQuantity(roundNumbers(theQuantity, 6))
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
              profit,
              quantity,
              quantityPercentage,
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
              setQuantity(value)
              priceAndProfitSync('quantity', value)
            }}
            value={quantity}
            postLabel="BTC"
          />

          <InlineInput
            label=""
            value={quantityPercentage}
            onChange={(value) => {
              setQuantityPercentage(value)
              priceAndProfitSync('quantityPercentage', value)
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
