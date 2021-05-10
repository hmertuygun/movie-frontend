import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => {
  return (
    <>
      <Link
        id="cp-tour1"
        className="navbar-brand"
        to="/trade"
        style={{ fontSize: '1.7rem', fontWeight: '700' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="512pt"
          viewBox="0 0 512 512"
          width="512pt"
          className="injected-svg svg-inject colorlogo"
          style={{
            height: '23px',
            width: 'auto',
            marginTop: '-5px',
            //paddingRight: '7px',
          }}
        >
          <path
            fill="#008aff"
            d="m197.332031 0h-160c-20.585937 0-37.332031 16.746094-37.332031 37.332031v96c0 20.589844 16.746094 37.335938 37.332031 37.335938h160c20.589844 0 37.335938-16.746094 37.335938-37.335938v-96c0-20.585937-16.746094-37.332031-37.335938-37.332031zm0 0"
          />
          <path
            fill="#1652f1"
            d="m197.332031 213.332031h-160c-20.585937 0-37.332031 16.746094-37.332031 37.335938v224c0 20.585937 16.746094 37.332031 37.332031 37.332031h160c20.589844 0 37.335938-16.746094 37.335938-37.332031v-224c0-20.589844-16.746094-37.335938-37.335938-37.335938zm0 0"
          />
          <path
            fill="#008aff"
            d="m474.667969 341.332031h-160c-20.589844 0-37.335938 16.746094-37.335938 37.335938v96c0 20.585937 16.746094 37.332031 37.335938 37.332031h160c20.585937 0 37.332031-16.746094 37.332031-37.332031v-96c0-20.589844-16.746094-37.335938-37.332031-37.335938zm0 0"
          />
          <path
            fill="#1652f1"
            d="m474.667969 0h-160c-20.589844 0-37.335938 16.746094-37.335938 37.332031v224c0 20.589844 16.746094 37.335938 37.335938 37.335938h160c20.585937 0 37.332031-16.746094 37.332031-37.335938v-224c0-20.585937-16.746094-37.332031-37.332031-37.332031zm0 0"
          />
        </svg>
        CoinPanel
        <img className="d-none" alt="placeholder" src="/" id="navbar-logo" />
      </Link>
    </>
  )
}

export default Logo
