import { BYBIT_CONTENT } from 'constants/RegisterContent'
import React from 'react'

const ByBitRegisterTemplate = () => {
  return (
    <div className="row position-relative zindex-110 p-2 h-100">
      <div className="col-12 text-center" style={{ height: '180px' }}>
        <figure className="w-100">
          <img
            alt="CoinPanel - Easy cryptocurrency trading bot"
            src="img/brand/coinpanel-bybit.png"
            className="img-fluid"
            style={{ maxWidth: '250px' }}
          />
        </figure>
      </div>
      <div className="col-md-12 text-center mx-auto">
        <h5 className="h3 text-white mt-3 mb-4">
          Get your hands on a suite of smart trading tools
        </h5>
        <p className="text-white opacity-9 mb-4">
          Are you ready for a revolutionary crypto trading experience? Simply
          connect your Bybit exchange account to CoinPanel to start trading.
        </p>
        <div className="row align-items-center mx-auto">
          <div className="text-center mx-auto opacity-9">
            <ul className="list-unstyled text-white">
              <ul className="list-unstyled text-white">
                <div>
                  {BYBIT_CONTENT.map((item) => (
                    <li className="py-2">
                      <p className="text-white mb-0 d-flex align-items">
                        <img src="/img/svg/misc/circle-check.svg" alt="check" />
                        <span className="ml-1">{item}</span>
                      </p>
                    </li>
                  ))}
                </div>
              </ul>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ByBitRegisterTemplate
