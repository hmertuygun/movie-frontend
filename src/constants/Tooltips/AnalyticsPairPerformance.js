const AnalyticsPairPerformanceTips = (
  <div className="tab-info">
    <p className="mb-2">
      Shows the final gain or loss for base and quote assets as a result of all
      trades performed during the chosen period.
    </p>
    At the present moment it has five columns: <br />
    <a href="#" rel="noopener noreferrer">
      PAIR{' '}
    </a>
    names the symbol, that has been traded <br />
    <a href="#" rel="noopener noreferrer">
      BASE{' '}
    </a>
    shows the deposit change as a final result of all trades where this asset
    has been involved. <br />
    <a href="#" rel="noopener noreferrer">
      QUOTE{' '}
    </a>
    the second symbol of the pair, shows how much of the quote asset has been
    gained or lost as a result of all trades during the chosen period.
    <br />
    <a href="#" rel="noopener noreferrer">
      BTC VALUE{' '}
    </a>
    shows the deposit change in terms of BTC.
    <br />
    <a href="#" rel="noopener noreferrer">
      USD VALUE{' '}
    </a>
    shows the deposit change in terms of USD
    <br />
    <p className="my-2">
      A positive number (in green color) means the trader has gained this
      amount.
    </p>
    <p>
      A negative number (in red color) means the trader has lost this amount.
    </p>
  </div>
)

export default AnalyticsPairPerformanceTips
