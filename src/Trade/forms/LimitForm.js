import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Input, Typography } from '../../components'
import Balance from '../components/Balance'

const LimitForm = () => {
  const handleSubmit = (event) => {
      event.preventDefault()
  }

  return (
    <Fragment>
   
      <Typography as="h2">1. Entry</Typography>

      <Balance balance="229.434343434" />

      <section>
      <form onSubmit={(e) => { 
      e.preventDefault() 
      handleSubmit(e) 
    }}>
        <Input 
          label="Price" 
          inlineLabel 
          type="number" 
          placeholder="Entry price"s
          postLabel="USDT"
          trade
          />


        <Input 
          label="Amount" 
          inlineLabel 
          type="number" 
          placeholder="Amount"
          postLabel="BTC"
          trade
          />


       <Input 
          label="Total" 
          inlineLabel 
          type="number" 
          placeholder=""
          postLabel="USDT"
          disabled
          trade
          />

          <Link to="/trade/target" primary>Set exits...</Link>
      </form>
      </section>
    </Fragment>)
}


export default LimitForm