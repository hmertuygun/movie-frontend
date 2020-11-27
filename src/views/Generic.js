import React from 'react'
import { Typography } from '../components'

const Generic = ({ ...props }) => {
  return (
    <main>
      <Typography as="h1">Page</Typography>

      <Typography>To be continued</Typography>
    </main>
  )
}

export default Generic
