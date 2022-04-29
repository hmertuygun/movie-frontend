import React from 'react'
import { CHART_MIRRORING_CONTENT } from 'constants/RegisterContent'

const chartRegisterTemplate = () => {
  return (
    <div className="row position-relative zindex-110 h-100">
      <div className="col-12 text-center" style={{ height: '180px' }}>
        <figure className="w-100">
          <img
            alt="CoinPanel - Easy cryptocurrency trading bot"
            src="https://coinpanel.com/assets/img/chart-mirroring-title.png"
            className="img-fluid"
            style={{ maxWidth: '270px' }}
          />
        </figure>
      </div>
      <div className="col-md-12 text-center mx-auto">
        <h5 className="h3 text-white mt-0 mb-4">
          Mirror Pro Traders' charts onto your chart. Live!
        </h5>
        <p className="text-white opacity-9 mb-4">
          Get direct access to the Pro Traders' charts without having to redraw
          patterns and trend lines by yourself. Pro Traders' charts are now
          available through Chart Mirroring.
        </p>
        <div className="row align-items-center mx-auto">
          <div className="text-center mx-auto opacity-9">
            <ul className="list-unstyled text-white">
              <div>
                {CHART_MIRRORING_CONTENT.map((item) => (
                  <li className="py-2">
                    <p className="text-white mb-0 d-flex align-items">
                      <img src="/img/svg/misc/circle-check.svg" alt="check" />
                      <span className="ml-1">{item}</span>
                    </p>
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default chartRegisterTemplate
