const AnalyticsPositionTips = (
  <div className="tab-info">
    <p className="mb-2">
      This table shows all positions for each trading pair for the chosen
      period. It fully replaces the previous positions section to be more
      flexible and robust.
    </p>
    At the present moment it has nine columns: <br />
    <a href="#" rel="noopener noreferrer">
      PAIR{' '}
    </a>
    trading pair that the user has traded <br />
    <a href="#" rel="noopener noreferrer">
      SIDE{' '}
    </a>
    direction of the trade (buy or sell) <br />
    <a href="#" rel="noopener noreferrer">
      ROE%{' '}
    </a>
    the percentage of return on equity. It compares the AVERAGE PRICE against
    the current market price and shows the percent difference between the two.
    If the position is green (positive), it means that the trader will make a
    profit by closing it now. Note that the position is green for the Buy
    direction if the current price is higher than the average buying price.
    However, the position is green in the Sell direction if the current price is
    lower than the average selling price. <br />
    <a href="#" rel="noopener noreferrer">
      PNL{' '}
    </a>
    the value of your profits or losses in the Quote asset (2nd in the pair)
    <br />
    <a href="#" rel="noopener noreferrer">
      AVERAGE PRICE{' '}
    </a>
    SUM (total amount of quote asset) divided by QUANTITY (total amount of base
    asset). If the average buying price (Side = Buy) is below the current market
    price, selling those assets will result in profit. Meaning that the user
    bought the asset cheaper than it cost now. And if the average selling price
    (Side = Sell) is above the current market price, it means the user has sold
    an asset at a higher price than it cost now. <br />
    <a href="#" rel="noopener noreferrer">
      CURRENT PRICE{' '}
    </a>
    current market price for one unit of the Base asset in units of Quote asset
    <br />
    <a href="#" rel="noopener noreferrer">
      QUANTITY{' '}
    </a>
    the total amount of the Base asset (1st in the pair) that has been
    bought/sold <br />
    <a href="#" rel="noopener noreferrer">
      SUM{' '}
    </a>
    the total amount of Quote asset (2nd in the pair) that has been bought/sold
    (in return for the Base asset)
    <br />
    <a href="#" rel="noopener noreferrer">
      OPERATIONS{' '}
    </a>
    total count of trading operations executed in that direction during the
    chosen period. <br />
  </div>
)

export default AnalyticsPositionTips
