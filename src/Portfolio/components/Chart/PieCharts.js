import React, { useEffect } from 'react'
import c3 from 'c3'
import './PieChart.css'

function PieCharts() {
  useEffect(() => {
    c3.generate({
      bindto: '#data',
      size: {
        height: 200,
        width: 420,
      },
      data: {
        columns: [
          ['BTC', 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.2],
          ['USDT', 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4],
        ],
        type: 'pie',
        onclick: function (d, i) {},
        onmouseover: function (d, i) {},
        onmouseout: function (d, i) {},
      },
      legend: {
        position: 'right',
        padding: 15,
        bottom: 20,
      },
    })
  }, [])

  return <div id="data"></div>
}

export default PieCharts
