import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Typography, InlineInput, Button } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'

function LimitForm() {
  const { addEntry } = useContext(TradeContext)
  const balance = 20000
  const [price, setPrice] = useState('')
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)

  const calculatePercentageQuantity = (inputChanged, value) => {
    if (!price) {
      return false
    }

    if (inputChanged === 'quantity') {
      setQuantityPercentage(((value * price) / balance) * 100)
      setTotal(value * price)
    }

    if (inputChanged === 'quantityPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = cost / price
      setQuantity(howManyBTC)
      setTotal(howManyBTC * price)
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {
      if (!price || !quantity) {
        return false
      }

      const canAfford = total <= balance
      setIsValid(canAfford && price && quantity)
    },
    [total, price],
    () => {
      setTotal(0)
      setPrice(0)
    }
  )

  return (
    <Fragment>
      <div style={{ marginTop: '2rem' }}>
        <Typography as="h3">1. Entry</Typography>
      </div>

      <div>BALANCE: {balance}</div>

      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            addEntry({ price, quantity, type: 'limit' })
          }}
        >
          <InlineInput
            label="Price"
            type="number"
            onChange={(value) => setPrice(value)}
            value={price}
            placeholder="Entry price"
            postLabel="USDT"
          />

          <InlineInput
            label="Amount"
            type="number"
            onChange={(value) => {
              setQuantity(value)
              calculatePercentageQuantity('quantity', value)
            }}
            value={quantity}
            placeholder="Amount"
            postLabel="BTC"
          />

          <InlineInput
            type="number"
            onChange={(value) => {
              setQuantityPercentage(value)
              calculatePercentageQuantity('quantityPercentage', value)
            }}
            value={quantityPercentage}
            placeholder="Amount"
            postLabel="%"
          />

          <InlineInput
            label="Total"
            type="number"
            value={total}
            placeholder=""
            postLabel="USDT"
            disabled
          />

          <Button disabled={isValid ? null : 'disabled'} type="submit">
            Set exits >
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default LimitForm
