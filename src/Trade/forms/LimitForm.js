import React, { Fragment, useState } from 'react'
import { Typography, InlineInput, Button } from '../../components'
// import { useTrade } from '../context/TradeContext'
import Balance, { useBalance } from '../components/Balance'

const LimitForm = () => {
  // get balance from Balance context ()
  // const [balance] = useBalance()
  const balance = 30
  const [price, setPirce] = useState()
  const [amount, setAmount] = useState()
  const [amountPercentage, setAmountPercentage] = useState()
  const [total, setTotal] = useState()

  const [isValid, setIsValid] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  const onChangeInputs = (value) => {}

  const handleAmount = (value) => {
    console.log(value)
  }

  return (
    <Fragment>
      <Typography as="h2">1. Entry</Typography>

      <Balance />

      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(e)
          }}
        >
          <InlineInput
            label="Price"
            inlineLabel
            type="number"
            onChange={(e) => {
              setAmountPercentage(e.target.value)
            }}
            value={amountPercentage}
            placeholder="Entry price"
            postLabel="USDT"
          />

          <InlineInput
            label="Amount"
            inlineLabel
            type="number"
            placeholder="Amount"
            postLabel="BTC"
          />

          <InlineInput
            inlineLabelff
            type="number"
            value={amountPercentage}
            onChange={(value) => handleAmount}
            placeholder="Amount"
            postLabel="%"
          />

          <InlineInput
            label="Total"
            inlineLabel
            type="number"
            placeholder=""
            postLabel="USDT"
            disabled
          />

          <Button disabled={isValid} type="submit">
            Set exits >
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default LimitForm
