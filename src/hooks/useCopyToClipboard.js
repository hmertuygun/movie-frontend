import React from 'react'
import copy from 'copy-to-clipboard'
import { consoleLogger } from 'utils/logger'

export default function useCopyToClipboard(resetInterval = null) {
  const [isCopied, setCopied] = React.useState(false)

  function handleCopy(text) {
    if (typeof text === 'string' || typeof text == 'number') {
      copy(text.toString())
      setCopied(true)
    } else {
      setCopied(false)
      consoleLogger(
        `Cannot copy typeof ${typeof text} to clipboard, must be a string or number.`
      )
    }
  }

  return [isCopied, handleCopy]
}
