import React from 'react'

const Icon = ({
  icon,
  width = '24',
  height = '24',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = '2',
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
}) => {
  if (!icon) {
    return 'Provide ICON to show icon'
  }

  return (
    <svg
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    >
      <use href={`/img/svg/misc/feather-sprite.svg#${icon}`} />
    </svg>
  )
}

export default Icon
