import React, { useState, useEffect, useContext } from 'react'
import { InlineInput, Button, TabNavigator, Typography } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'
import roundNumbers from '../../helpers/roundNumbers'
import { useSymbolContext } from '../context/SymbolContext'

const ExitTarget = () => {
  const { isLoading, selectedSymbolDetail } = useSymbolContext()
  const [price, setPrice] = useState('')
  const [profit, setProfit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [isValid, setIsValid] = useState(false)

  const { addTarget, state } = useContext(TradeContext)
  // ingoing value
  const { entry } = state

  useEffect(() => {
    setPrice(entry.price)
  }, [entry])

  // VALIDATE FORM
  useEffect(() => {
    if (price !== entry.price && price && quantity <= entry.quantity) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
  }, [price, quantity, entry.quantity, entry.price])

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

    if (inputChanged === 'quantity' && value <= entry.quantity) {
      setQuantityPercentage(roundNumbers((value / entry.quantity) * 100, 4))
    }

    if ((inputChanged === 'quantityPercentage' && value < 101) || value > 0) {
      const theQuantity = (entry.quantity * value) / 100
      setQuantity(roundNumbers(theQuantity, 6))
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
              quantity,
              profit,
              symbol: selectedSymbolDetail['value'] 
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
            postLabel={ selectedSymbolDetail['quote_asset'] } 
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
            label="Quantity"
            type="number"
            onChange={(value) => {
              priceAndProfitSync('quantity', value)
              setQuantity(value)
            }}
            value={quantity}
            postLabel={isLoading ? "" : selectedSymbolDetail['base_asset']}
          />

          <InlineInput
            label=""
            type="number"
            onChange={(value) => {
              setQuantityPercentage(value)
              priceAndProfitSync('quantityPercentage', value)
            }}
            value={quantityPercentage}
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
