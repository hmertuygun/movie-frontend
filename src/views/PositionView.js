import React, { useContext, useState, useEffect } from 'react'
import AccordionContainer from '../Position/components/Accordion/AccordionContainer'
import { UserContext } from '../contexts/UserContext'
import precisionRound from '../helpers/precisionRound'
import { firebase } from '../firebase/firebase'
const db = firebase.firestore()

const Position = () => {
  const [checkProgress, setCheckProgress] = useState(false)
  const { userData, activeExchange, orderHistoryProgressUC } = useContext(UserContext)
  const [orderHistoryProgressPV, setOrderHistoryProgressPV] = useState('100.00')
  let FBOrderHistoryLoad

  const ProgressBar = (
    <div className="progress-wrapper" style={{ maxWidth: '1200px', margin: '48px auto' }}>
      <span className="progress-label text-muted">
        Processing Order History..
      </span>
      <span className="progress-percentage text-muted">{`${orderHistoryProgressUC !== '100.00' ? orderHistoryProgressUC : orderHistoryProgressPV}%`}</span>
      <div className="mt-2 progress" style={{ height: `8px` }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${orderHistoryProgressUC !== '100.00' ? orderHistoryProgressUC : orderHistoryProgressPV}%` }}
        ></div>
      </div>
    </div>
  )

  const orderHistoryLoadedFBCallback = (doc) => {
    if (!doc?.data()) return
    let isActiveExchangeSelected = false
    let loaded = 0, total = 0
    // Loop through FB object and see if some key is in processing. e.g: loaded != total
    let keyArr = Object.entries(doc.data()).sort()
    for (let i = 0; i < keyArr.length; i += 2) {
      let [item, no] = keyArr[i] // loaded
      let [item1, no1] = keyArr[i + 1] //total
      let [apiName, exchange] = item.split("__")
      exchange = exchange.split("_")[0]
      if (!isActiveExchangeSelected) {
        isActiveExchangeSelected = activeExchange.apiKeyName === apiName && activeExchange.exchange === exchange
        if (isActiveExchangeSelected) {
          loaded = no
          total = no1
        }
      }
    }
    if (isActiveExchangeSelected) {
      let progress = precisionRound((loaded / total) * 100)
      setOrderHistoryProgressPV(progress)
    }
    setCheckProgress(true)
  }

  useEffect(() => {
    FBOrderHistoryLoad = db.collection('order_history_load')
      .doc(userData.email)
      .onSnapshot(
        orderHistoryLoadedFBCallback,
        (err) => {
          console.error(err)
        }
      )

    return () => {
      FBOrderHistoryLoad()
    }
  }, [])

  const toRender = () => {
    if (!checkProgress) return null
    else if (checkProgress && orderHistoryProgressPV === '100.00' && orderHistoryProgressUC === '100.00') return <AccordionContainer />
    else if (checkProgress && (orderHistoryProgressPV !== '100.00' || orderHistoryProgressUC !== '100.00')) return ProgressBar
  }

  return (
    <>
      {toRender()}
    </>
  )
}

export default Position
