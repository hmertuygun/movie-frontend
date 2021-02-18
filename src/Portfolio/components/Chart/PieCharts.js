import React, { useEffect, useContext, useState } from 'react'
import c3 from 'c3'
import { PortfolioContext } from '../../context/PortfolioContext'

import './PieChart.css'

const PieCharts = () => {
  const [legend, setLegend] = useState({})
  const [data, setData] = useState([])
  const [extData, setExtData] = useState(null)
  const { chart } = useContext(PortfolioContext)
  let colorArray = ['#E64D66', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#99E6E6', '#9900B3',
    '#6666FF', '#4DB380', '#FF4D4D', '#4D80CC', '#FF6633'].reverse()

  useEffect(() => {
    if (!chart) {
      setData([])
    } else {
      let pieColors = {}
      let copyData = [...chart]
      copyData.forEach((item, index, arr) => {
        pieColors[item[0]] = colorArray[index]
      })
      setLegend(pieColors)
      setData(copyData)
    }
  }, [chart])

  const onLegendItemClick = (id) => {
    let copyData = [...data]
    if (extData) {
      copyData = [...copyData, extData.item]
      if (extData.item[0] === id) {
        setExtData(null)
      }
      else {
        let index = copyData.findIndex(item => item[0] === id)
        let item = copyData.splice(index, 1)
        setExtData({ item: item[0], index })
      }
    }
    else {
      let index = copyData.findIndex(item => item[0] === id)
      let item = copyData.splice(index, 1)
      setExtData({ item: item[0], index })
    }
    setData(copyData)
  }

  useEffect(() => {
    if (!data || !data.length) return
    c3.generate({
      bindto: '#data',
      size: {
        height: 160,
        width: 160,
      },
      data: {
        columns: data || [],
        type: 'pie',
        colors: legend,
        onclick: function (d, i) {
          // console.log('onclick', d, i)
        },
        onmouseover: function (d, i) {
          // console.log('onmouseover', d, i)
        },
        onmouseout: function (d, i) {
          // console.log('onmouseout', d, i)
        },
      },
      legend: {
        show: false,
        position: 'right',
        padding: 15,
        item: {
        }
      },
    })
  }, [data])

  let rows = 5
  let pieKeys = []
  let legendArr = Object.entries(legend)
  for (let i = 0; i < legendArr.length; i++) {
    let item = legendArr[i]
    if (i % rows === 0) pieKeys.push([])
    let fIndex = Math.floor(i / rows)
    let sIndex = i % rows
    pieKeys[fIndex][sIndex] = { symbol: item[0], color: item[1] }
  }
  return (
    <div className="chart-container">
      <div id="data"></div>
      <div className="custom-legend row">
        {
          pieKeys.map((item, index) => (
            <div className='col-auto pr-0' key={`col-${index}`}>
              {
                item.map(item1 => (
                  <div className="legend-item" onClick={() => onLegendItemClick(item1.symbol)} key={`${item1.symbol}-${item1.color}`}>
                    <div className="color-block" style={{ background: item1.color }}>&nbsp;</div>
                    <span style={{ textDecoration: extData && extData.symbol === item1.symbol ? 'line-through' : 'none' }}>{item1.symbol}</span>
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default PieCharts
