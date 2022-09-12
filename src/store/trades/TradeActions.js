import LZUTF8 from 'lzutf8'
import { getAnalystDrawing } from 'store/actions'
import isJSONString from 'utils/jsonString'
import tradeSlice from './TradeSlice'

const { setIsTradersModalOpen, setActiveTrader } = tradeSlice.actions

const updateIsTradersModalOpen = (value) => async (dispatch) => {
  dispatch(setIsTradersModalOpen(value))
}

const updateActiveTrader = (value) => async (dispatch) => {
  dispatch(setActiveTrader(value))
}

const setActiveAnalysts =
  (chartMetaData, allAnalysts, planned = null) =>
  async (dispatch) => {
    let trader = ''
    if (!planned) {
      if (!chartMetaData?.activeTrader) return
      trader = chartMetaData.activeTrader
    } else if (planned) {
      trader = planned
    }
    let sharedData = await dispatch(getAnalystDrawing(trader))
    sharedData = sharedData.payload.data
    const analystData = allAnalysts.find((analyst) => analyst.id === trader)
    const { drawings } = sharedData[trader]
    let converted = ''
    try {
      converted = JSON.parse(drawings)
    } catch (error) {
      converted = LZUTF8.decompress(drawings, {
        inputEncoding: 'Base64',
      })
      if (isJSONString(converted)) converted = JSON.parse(converted)
    }

    const processedData = {
      ...sharedData,
      ...analystData,
      id: trader,
      drawings: JSON.stringify(converted),
    }

    dispatch(updateActiveTrader(processedData))
  }

export { updateIsTradersModalOpen, updateActiveTrader, setActiveAnalysts }
