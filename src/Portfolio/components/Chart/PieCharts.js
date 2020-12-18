import React, { useEffect } from 'react'
import c3 from 'c3'

function PieCharts() {
  useEffect(() => {
    c3.generate({
      bindto: '#data', // default is di="chart" use bindto to reconfig
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
    })
  }, [])

  return <div id="data"></div>
}

export default PieCharts
