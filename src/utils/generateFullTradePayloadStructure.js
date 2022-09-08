export const generateFullTradePayloadStructure = ({
  entry,
  targets,
  stoploss,
  apiKeyName,
  exchange,
}) => {
  const newTargets = targets.map((target, index) => {
    const { side, type, symbol, quantity, price, triggerPrice } = target
    return {
      targetNumber: index + 1,
      percentage: (target.quantity / entry.quantity) * 100,
      quantity,
      side,
      type,
      symbol,
      trigger: triggerPrice,
      price,
    }
  })
  const newStoploss = stoploss.map((stoploss) => {
    const { side, type, symbol, quantity, triggerPrice, price } = stoploss
    return {
      side,
      type,
      symbol,
      quantity,
      trigger: triggerPrice,
      price,
      percentage: (stoploss.quantity / entry.quantity) * 100,
    }
  })
  const data = {
    entryOrder: entry,
    targets: newTargets,
    stopLoss: { ...newStoploss[0] },
    exchange: exchange,
    apiKeyName: apiKeyName,
  }

  return data
}
