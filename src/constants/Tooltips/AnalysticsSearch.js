const AnalyticsSearchTips = (
  <div className="tab-info">
    <p className="mb-2">
      This is where the trader should specify the exact period for which
      analytics should be calculated.
    </p>
    <a href="#" rel="noopener noreferrer">
      Symbol{' '}
    </a>
    a particular symbol that should be present in a trading pair, allows
    narrowing analytics
    <br />
    <a href="#" rel="noopener noreferrer">
      Start Date{' '}
    </a>
    the date when the trader entered the position
    <br />
    <a href="#" rel="noopener noreferrer">
      End Date{' '}
    </a>
    the date when the trader has closed the position (or current date if the
    position is still open)
    <br />
    <a href="#" rel="noopener noreferrer">
      Refresh button{' '}
    </a>
    this button refreshes all data that is used by analytics <br />
    <p className="my-2">
      The trader should clearly state the date when the position was entered and
      closed. If the position is still open, the trader may leave the End Date
      field empty or enter the current date.
    </p>
    <p className="my-2">
      New analytics shows long positions (assets bought to be sold at a higher
      price later) and short positions as well (assets sold to be bought back at
      a lower price later on).
    </p>
  </div>
)

export default AnalyticsSearchTips
