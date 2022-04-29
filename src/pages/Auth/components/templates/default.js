import React from 'react'
import { DEFAULT_CONTENT } from 'constants/RegisterContent'

const defaultRegisterTemplate = () => {
  return (
    <section>
      <div
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}img/icons/Coinpanel_White.svg)`,
        }}
        className="custom-bg-image"
      ></div>
      <div className="d-flex align-items-center">
        <img
          src="/img/icons/Coinpanel_White.svg"
          alt="white-logo"
          style={{ width: 40 }}
        />
        <h4 className="text-white h2 mb-0 ml-2">CoinPanel</h4>
      </div>
      <img
        src="/img/misc/iphone.png"
        alt="iphone"
        className="w-50 position-absolute top-5 right-n8"
      />
      <div className="ml-2 mt-5">
        <h2 className="h1 text-white section-title w-75">
          Smart crypto trading
        </h2>
        <p className="text-white w-75 mt-4 section-description">
          Connect your exchanges and never be{' '}
          <strong>tied to your screen again.</strong>
        </p>
        <div>
          {DEFAULT_CONTENT.map((item) => (
            <p className="text-white mb-0 d-flex align-items">
              <img src="/img/svg/misc/circle-check.svg" alt="check" />
              <span className="ml-1">{item}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default defaultRegisterTemplate
