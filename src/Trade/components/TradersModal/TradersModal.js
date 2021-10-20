import React, { useEffect, useState, useContext } from 'react'
import { useSymbolContext } from '../../context/SymbolContext'
import { UserContext } from '../../../contexts/UserContext'
import Modal from '../../../components/Modal/Modal'
import { X } from 'react-feather'
import Button from '../../../components/Button/Button'
import { firebase } from '../../../firebase/firebase'

const TradeOverview = () => {
  const db = firebase.firestore()
  const [traders, setTraders] = useState([])
  const {
    setIsTradersModalOpen,
    setActiveTrader,
    activeTrader,
    setTemplateDrawingsOpen,
    templateDrawingsOpen,
  } = useSymbolContext()
  const { userData } = useContext(UserContext)

  useEffect(() => {
    db.collection('template_drawings')
      .get()
      .then(
        (snapshot) => {
          const allTraders = snapshot.docs.map((tr) => {
            return { id: tr.id, ...tr.data() }
          })
          setTraders(allTraders)
        },
        (error) => {
          console.error(error)
        }
      )
  }, [db])

  const changeTrader = async (trader) => {
    if (!trader) return
    await db.collection('chart_drawings').doc(userData.email).set(
      {
        activeTrader: trader.id,
      },
      { merge: true }
    )
    setActiveTrader(trader)
    if (!templateDrawingsOpen) {
      setTemplateDrawingsOpen((templateDrawingsOpen) => {
        localStorage.setItem('chartMirroring', !templateDrawingsOpen)
        return !templateDrawingsOpen
      })
    }
    setIsTradersModalOpen(false)
  }

  const isActiveTrader = (trader) => {
    if (!activeTrader) return ''
    return activeTrader.id == trader.id ? 'active' : ''
  }

  const timestampToDate = (time) => {
    var a = new Date(time)
    var months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    var year = a.getFullYear()
    var month = months[a.getMonth()]
    var date = a.getDate()
    var hour = a.getHours()
    var min = a.getMinutes()
    var time = ' ' + date + ' ' + month + ' ' + hour + ':' + min
    return time
  }

  return (
    <div>
      <Modal
        onClose={() =>
          setIsTradersModalOpen((isTradersModalOpen) => !isTradersModalOpen)
        }
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              right: '10px',
              zIndex: '1',
              padding: '1rem',
            }}
          >
            <Button
              onClick={() =>
                setIsTradersModalOpen(
                  (isTradersModalOpen) => !isTradersModalOpen
                )
              }
              remove
            >
              <X size="20" color="white" />
            </Button>
          </div>
          <ul
            className="list-group"
            style={{
              marginRight: '4rem',
              width: '23rem',
            }}
          >
            {traders.map((row, index) => (
              <li
                onClick={() => changeTrader(row)}
                key={row.id}
                className={`list-group-item d-flex masonry-filter justify-content-between align-items-center ${isActiveTrader(
                  row
                )}`}
              >
                {row.name}
                <span className="badge badge-primary badge-pill bg-light-info">
                  Updated:
                  {timestampToDate(Number(row.lastUpdate))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  )
}

export default TradeOverview
