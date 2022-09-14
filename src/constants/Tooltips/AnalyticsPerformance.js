const AnalyticsPerformanceTips = (
  <div className="tab-info">
    <p className="mb-2">
      Shows the performance per each asset that has been traded during the
      chosen period. Even if it has been traded on multiple different pairs.
    </p>
    At the present moment it has four columns: <br />
    <a href="#" rel="noopener noreferrer">
      ASSET{' '}
    </a>
    names the symbol, that has been traded <br />
    <a href="#" rel="noopener noreferrer">
      CHANGE{' '}
    </a>
    shows the deposit change as a final result of all trades where this asset
    has been involved.
    <br />
    <a href="#" rel="noopener noreferrer">
      BTC VALUE{' '}
    </a>
    shows the deposit change in terms of BTC <br />
    <a href="#" rel="noopener noreferrer">
      USD VALUE{' '}
    </a>
    shows the deposit change in terms of USD <br />
    <p className="my-2">
      A positive change (in green color) means the trader has increased the
      deposit by this value.
    </p>
    <p className="my-2">
      A negative change (in red color) means the deposit has decreased by the
      amount shown.
    </p>
  </div>
)

export default AnalyticsPerformanceTips
