import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const SIZE = 350
const RADIUS = SIZE / 2

const SunburstChart = ({ data }) => {
  const svgRef = useRef(null)
  const [viewBox, setViewBox] = useState('0,0,0,0')

  const partition = (data) =>
    d3.partition().size([2 * Math.PI, RADIUS])(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    )

  const color = d3.scaleOrdinal(
    d3.quantize(d3.interpolateRainbow, data.children.length + 1)
  )

  const format = d3.format(',d')

  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(RADIUS / 2)
    .innerRadius((d) => d.y0)
    .outerRadius((d) => d.y1 - 1)

  const getAutoBox = () => {
    if (!svgRef.current) {
      return ''
    }

    const { x, y, width, height } = svgRef.current.getBBox()

    return [x, y, width, height].toString()
  }

  useEffect(() => {
    setViewBox(getAutoBox())
  }, [])

  const getColor = (d) => {
    while (d.depth > 1) d = d.parent
    return color(d.data.name)
  }

  const getTextTransform = (d) => {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI
    const y = (d.y0 + d.y1) / 2
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`
  }

  const root = partition(data)

  return (
    <svg width={SIZE} height={SIZE} viewBox={viewBox} ref={svgRef}>
      <g fillOpacity={0.6}>
        {root
          .descendants()
          .filter((d) => d.depth)
          .map((d, i) => (
            <path key={`${d.data.name}-${i}`} fill={getColor(d)} d={arc(d)}>
              <text>
                {d
                  .ancestors()
                  .map((d) => d.data.name)
                  .reverse()
                  .join('/')}
                \n${format(d.value)}
              </text>
            </path>
          ))}
      </g>
      <g
        pointerEvents="none"
        textAnchor="middle"
        fontSize={10}
        fontFamily="sans-serif"
      >
        {root
          .descendants()
          .filter((d) => d.depth && ((d.y0 + d.y1) / 2) * (d.x1 - d.x0) > 10)
          .map((d, i) => (
            <text
              key={`${d.data.name}-${i}`}
              transform={getTextTransform(d)}
              dy="0.35em"
              fontSize={14}
            >
              {d.data.name}
            </text>
          ))}
      </g>
    </svg>
  )
}

export default SunburstChart
