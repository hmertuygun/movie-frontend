import React, { Fragment, useContext } from 'react'
import { Typography, Button } from '../../../components'
import { TradeContext } from '../../context/SimpleTradeContext'
import roundNumbers from '../../../helpers/roundNumbers'
import styles from './TradeModal.module.css'

const TradeModal = ({ onClose, placeOrder }) => {
  const { state } = useContext(TradeContext)

  return (
    <article className={styles['TradeModal-Container']}>
      <header className={styles['TradeModal-header']}>
        <Typography as="h2">Order confirmation</Typography>
      </header>

      <main className={styles['TradeModal-Main']}>
        <Typography>The trade</Typography>

        <Typography>
          Entry price:
          {state.entry.price}
        </Typography>
        <Typography>
          Entry amount:
          {state.entry.quantity}
        </Typography>

        <Typography as="h3">Stoploss</Typography>

        {state.stoploss.map((stoploss, index) => (
          <Fragment key={index}>
            <Typography>
              Trigger price:
              {stoploss.triggerPrice}
            </Typography>

            <Typography>
              Amount: {stoploss.quantity} (
              {roundNumbers(stoploss.quantity / state.entry.quantity) * 100}
              %)
            </Typography>
          </Fragment>
        ))}

        <Typography as="h3">Target(s)</Typography>

        {state.targets.map((target, index) => (
          <Fragment key={index}>
            <Typography>Target price: {target.price}</Typography>

            <Typography>
              Amount: {target.quantity} (
              {roundNumbers(target.quantity / state.entry.quantity) * 100}%)
            </Typography>
          </Fragment>
        ))}

        <Typography>Trade summary</Typography>
      </main>

      <footer className={styles['TradeModal-Footer']}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="confirm" onClick={placeOrder}>
          Confirm
        </Button>
      </footer>
    </article>
  )
}

export default TradeModal
