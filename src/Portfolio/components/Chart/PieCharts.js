import React, { useEffect, useMemo, useContext, useState } from 'react'
import c3 from 'c3'
import { PortfolioContext } from '../../context/PortfolioContext'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { ChevronLeft, ChevronRight } from 'react-feather'

import './PieChart.css'

const PieCharts = ({ isHideBalance }) => {
  const [legend, setLegend] = useState({})
  const [data, setData] = useState([])
  const [extData, setExtData] = useState(null)
  const [pieKeys, setPieKeys] = useState([])
  const { chart, balance } = useContext(PortfolioContext)

  const colorArray = useMemo(() => {
    return [
      '#E64D66',
      '#FFB399',
      '#FF33FF',
      '#FFFF99',
      '#00B3E6',
      '#E6B333',
      '#3366E6',
      '#999966',
      '#99FF99',
      '#B34D4D',
      '#80B300',
      '#809900',
      '#E6B3B3',
      '#6680B3',
      '#66991A',
      '#FF99E6',
      '#CCFF1A',
      '#FF1A66',
      '#E6331A',
      '#33FFCC',
      '#66994D',
      '#B366CC',
      '#4D8000',
      '#B33300',
      '#CC80CC',
      '#66664D',
      '#991AFF',
      '#E666FF',
      '#4DB3FF',
      '#1AB399',
      '#E666B3',
      '#33991A',
      '#CC9999',
      '#B3B31A',
      '#00E680',
      '#4D8066',
      '#809980',
      '#E6FF80',
      '#1AFF33',
      '#999933',
      '#FF3380',
      '#CCCC00',
      '#66E64D',
      '#99E6E6',
      '#9900B3',
      '#6666FF',
      '#4DB380',
      '#FF4D4D',
      '#4D80CC',
      '#FF6633',
    ].reverse()
  }, [])

  useEffect(() => {
    if (!chart) {
      setData([])
    } else {
      let pieColors = {}
      let copyData = [...chart]
      let sortedData = copyData.sort((a, b) => {
        return b[1] - a[1]
      })

      sortedData.forEach((item, index, arr) => {
        pieColors[item[0]] = colorArray[index]
      })

      const filteredPieColors = Object.fromEntries(
        Object.entries(pieColors).filter(([key, val]) => {
          if (isHideBalance) {
            const chartItemBalance = balance.find(
              (balanceItem) => balanceItem.SYMBOL === key
            )?.USD
            return chartItemBalance >= 10
          } else {
            return true
          }
        })
      )
      const filteredData = sortedData
        .filter((item) => {
          if (extData) {
            return item[0] !== extData.item[0]
          } else {
            return true
          }
        })
        .filter((item) => {
          if (isHideBalance) {
            const chartItemBalance = balance.find(
              (balanceItem) => balanceItem.SYMBOL === item[0]
            )?.USD
            return chartItemBalance >= 10
          } else {
            return true
          }
        })
      setLegend(filteredPieColors)
      setData(filteredData)
    }
  }, [chart, balance, isHideBalance, colorArray, extData])

  const onLegendItemClick = (id) => {
    let sortedData = [...data]
    if (extData) {
      sortedData = [...sortedData, extData.item]
      if (extData.item[0] === id) {
        setExtData(null)
      } else {
        let index = sortedData.findIndex((item) => item[0] === id)
        let item = sortedData.splice(index, 1)
        setExtData({ item: item[0], index })
      }
    } else {
      let index = sortedData.findIndex((item) => item[0] === id)
      let item = sortedData.splice(index, 1)
      setExtData({ item: item[0], index })
    }
    setData(sortedData)
  }

  useEffect(() => {
    if (!data || !data.length) return
    c3.generate({
      bindto: '#data',
      size: {
        height: 360,
        width: 360,
      },
      data: {
        columns: data || [],
        type: 'pie',
        colors: legend,
      },
      legend: {
        show: false,
        padding: 15,
        item: {},
      },
    })
  }, [data, legend])

  useEffect(() => {
    let rows = 8
    let pieKey = []
    let legendArr = Object.entries(legend)
    for (let i = 0; i < legendArr.length; i++) {
      let item = legendArr[i]
      if (i % rows === 0) pieKey.push([])
      let fIndex = Math.floor(i / rows)
      let sIndex = i % rows
      pieKey[fIndex][sIndex] = { symbol: item[0], color: item[1] }
    }
    setPieKeys(pieKey)
  }, [legend])
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    arrows: true,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  }

  function NextArrow(props) {
    const { className, style, onClick } = props
    return (
      <ChevronRight
        className={className}
        strokeWidth="2"
        stroke="lightgrey"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        size={15}
        style={{ ...style, display: 'block' }}
        onClick={onClick}
      />
    )
  }

  function PrevArrow(props) {
    const { className, style, onClick } = props
    return (
      <ChevronLeft
        className={className}
        strokeWidth="2"
        stroke="lightgrey"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        size={15}
        style={{ ...style, display: 'block' }}
        onClick={onClick}
      />
    )
  }
  return (
    <div className="chart-container">
      <div id="data"></div>
      <div className="custom-legend row">
        <Slider {...settings}>
          {pieKeys.map((item, index) => (
            <div className="col-auto pr-0" key={`col-${index}`}>
              {item.map((item1) => (
                <div
                  className="legend-item"
                  onClick={() => onLegendItemClick(item1.symbol)}
                  key={`${item1.symbol}-${item1.color}`}
                >
                  <div
                    className="color-block"
                    style={{ background: item1.color }}
                  >
                    &nbsp;
                  </div>
                  <span
                    style={{
                      textDecoration:
                        extData && extData.item[0] === item1.symbol
                          ? 'line-through'
                          : 'none',
                    }}
                  >
                    {item1.symbol}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default PieCharts
