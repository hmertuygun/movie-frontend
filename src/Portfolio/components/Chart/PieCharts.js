import React, { useEffect, useContext, useState } from 'react'
import c3 from 'c3'
import { PortfolioContext } from '../../context/PortfolioContext'

import './PieChart.css'

const PieCharts = () => {
  const [data, setData] = useState([])

  const { chart } = useContext(PortfolioContext)

  useEffect(() => {
    if (!chart) {
      setData([])
    } else {
      setData(chart)
    }
  }, [chart])

  useEffect(() => {
    c3.generate({
      bindto: '#data',
      size: {
        height: 160,
        width: 400,
      },
      data: {
        columns: data,
        type: 'pie',
        onclick: function (d, i) {
          console.log('onclick', d, i)
        },
        onmouseover: function (d, i) {
          console.log('onmouseover', d, i)
        },
        onmouseout: function (d, i) {
          console.log('onmouseout', d, i)
        },
      },
      legend: {
        position: 'right',
        padding: 15,
      },
    })
  }, [data])

  return <div id="data"></div>
}

export default PieCharts
