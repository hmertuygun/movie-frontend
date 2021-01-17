import React, { Fragment, useState, useEffect, useContext } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { faWallet } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { TradeContext } from '../context/SimpleTradeContext'
import { useSymbolContext } from '../context/SymbolContext'

import { Typography, InlineInput, Button, Icon } from '../../components'

import styles from './LimitForm.module.css'

function LimitForm() {
  const {
    isLoading,
    selectedSymbolDetail,
    selectedSymbolBalance,
    isLoadingBalance,
  } = useSymbolContext()
  const { addEntry } = useContext(TradeContext)
  const balance = selectedSymbolBalance
  const [price, setPrice] = useState('')
  // @TOOD:
  // Remove amount, and leave only quantity
  const [quantity, setQuantity] = useState('')
  const [quantityPercentage, setQuantityPercentage] = useState('')
  const [total, setTotal] = useState('')
  const [isValid, setIsValid] = useState(false)
  const marks = {
    0: '',
    25: '',
    50: '',
    75: '',
    100: '',
  }

  const round = (value, decimals) => {
    if (value === 0) {
      return 0
    }

    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }

  const handleSliderChange = (newValue) => {
    setQuantityPercentage(newValue)
    calculatePercentageQuantity('quantityPercentage', newValue)
  }

  const handleInputChange = (value) => {
    setQuantityPercentage(value === '' ? '' : Number(value))
    calculatePercentageQuantity('quantityPercentage', value)
  }

  const handleBlur = () => {
    if (quantityPercentage < 0) {
      setQuantityPercentage(0)
      calculatePercentageQuantity('quantityPercentage', 0)
    } else if (quantityPercentage > 100) {
      setQuantityPercentage(100)
      calculatePercentageQuantity('quantityPercentage', 100)
    }
  }

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
    [total, price, quantity, balance],
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

      <div>
        <FontAwesomeIcon icon={faWallet} />
        {'  '}
        {isLoadingBalance
          ? ' '
          : round(
              selectedSymbolBalance,
              selectedSymbolDetail['quote_asset_precision']
            )}
        {'  '}
        {selectedSymbolDetail['quote_asset']}
        {'  '}
        {isLoadingBalance ? (
          <span
            className="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
        ) : (
          ''
        )}
      </div>

      <section>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const symbol = selectedSymbolDetail['symbolpair']
            addEntry({ price, quantity, symbol, type: 'limit' })
          }}
        >
          <InlineInput
            label="Price"
            type="number"
            onChange={(value) => setPrice(value)}
            value={price}
            placeholder="Entry price"
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
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
            postLabel={isLoading ? '' : selectedSymbolDetail['base_asset']}
          />
          <div className={styles['SliderRow']}>
            <div className={styles['SliderSlider']}>
              <Slider
                defaultValue={0}
                step={1}
                marks={marks}
                min={0}
                max={100}
                onChange={handleSliderChange}
                value={quantityPercentage}
              />
            </div>

            <div className={styles['SliderInput']}>
              <InlineInput
                value={quantityPercentage}
                margin="dense"
                onChange={handleInputChange}
                onBlur={handleBlur}
                postLabel={'%'}
                small
              />
            </div>
          </div>

          <InlineInput
            label="Total"
            type="number"
            value={total}
            placeholder=""
            postLabel={isLoading ? '' : selectedSymbolDetail['quote_asset']}
            disabled
          />

          <Button
            variant="exits"
            disabled={isValid ? null : 'disabled'}
            type="submit"
          >
            Set exits >
          </Button>
        </form>
      </section>
    </Fragment>
  )
}

export default LimitForm
