import LZUTF8 from 'lzutf8'
import { getSnapShotDocument } from 'services/api'
import tradeSlice from './TradeSlice'

const { setIsTradersModalOpen, setActiveTrader } = tradeSlice.actions

const updateIsTradersModalOpen = (value) => async (dispatch) => {
  dispatch(setIsTradersModalOpen(value))
}

const updateActiveTrader = (value) => async (dispatch) => {
  dispatch(setActiveTrader(value))
}

const setActiveAnalysts =
  (userData, planned = null) =>
  async (dispatch) => {
    let trader = ''
    if (!planned) {
      const snapshot = await getSnapShotDocument(
        'chart_drawings',
        userData.email
      ).get()

      const data = snapshot.data()
      if (!data.activeTrader) return
      trader = data.activeTrader
    } else if (planned) {
      trader = planned
    }
    const sharedData = await getSnapShotDocument('chart_shared', trader).get()
    const analystData = await getSnapShotDocument('analysts', trader).get()

    let converted = ''
    try {
      converted = JSON.parse(sharedData.data().drawings)
    } catch (error) {
      converted = LZUTF8.decompress(sharedData.data().drawings, {
        inputEncoding: 'Base64',
      })
      converted = JSON.parse(converted)
    }

    const processedData = {
      ...sharedData.data(),
      ...analystData.data(),
      id: sharedData.id,
      drawings: JSON.stringify(converted),
    }

    dispatch(updateActiveTrader(processedData))
  }

export { updateIsTradersModalOpen, updateActiveTrader, setActiveAnalysts }
