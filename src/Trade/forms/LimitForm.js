import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Typography, InlineInput, Button } from '../../components'
import { TradeContext } from '../context/SimpleTradeContext'

function LimitForm() {
  const { addEntry } = useContext(TradeContext)

  const balance = 20000
  const [price, setPrice] = useState('')
  const [amount, setAmount] = useState('')
  const [amountPercentage, setAmountPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)

  const calculatePercentageAmount = (inputChanged, value) => {
    if (!price) {
      return false
    }

    if (inputChanged === 'amount') {
      setAmountPercentage(((value * price) / balance) * 100)
      setTotal(value * price)
    }

    if (inputChanged === 'amountPercentage') {
      // how many BTC can we buy with the percentage?
      const belowOnePercentage = value / 100
      const cost = belowOnePercentage * balance
      const howManyBTC = cost / price
      setAmount(howManyBTC)
      setTotal(howManyBTC * price)
    }
  }

  // CHECKER for isValid ? true : false
  useEffect(
    () => {
      // console.log('Changing the values')
      if (!price) {
        return false
      }

      const canAfford = total <= balance
      setIsValid(canAfford)
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
            addEntry({ price, amount })
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
              setAmount(value)
              calculatePercentageAmount('amount', value)
            }}
            value={amount}
            placeholder="Amount"
            postLabel="BTC"
          />

          <InlineInput
            type="number"
            onChange={(value) => {
              setAmountPercentage(value)
              calculatePercentageAmount('amountPercentage', value)
            }}
            value={amountPercentage}
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
