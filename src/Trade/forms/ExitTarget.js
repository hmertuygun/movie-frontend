import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { Input, Typography } from '../../components'

const ExitTarget = () => {
  const handleSubmit = (event) => {
      event.preventDefault()
  }

  return (
    <Fragment>
   
      <Typography as="h2">2. Exits</Typography>

      <section>
      <form onSubmit={(e) => { 
      e.preventDefault() 
      handleSubmit(e) 
    }}>
        <Input 
          label="Trigger price" 
          inlineLabel 
          type="number" 
          placeholder="Trigger price"
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


export default ExitTarget