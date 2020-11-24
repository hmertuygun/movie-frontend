import React from 'react'
import Button from './Button'

const story = {
  title: 'Component/Button',
  component: Button,
  argTypes: {
    children: 'name',
    primary: {
      control: false,
    },
  },
}

export default story

const Template = (args) => <Button {...args} />

export const Primary = Template.bind({})
Primary.args = {
  children: 'Log in',
  primary: true,
}

export const Small = Template.bind({})
Small.args = {
  children: 'Log in',
  size: 'small',
}

export const Next = Template.bind({})
Next.args = {
  children: 'Next',
  type: 'secondary',
}

export const Buy = Template.bind({})
Buy.args = {
  children: 'Buy',
  variant: 'buy',
}

export const Sell = Template.bind({})
Sell.args = {
  children: 'Order',
  variant: 'sell',
}

export const Order = Template.bind({})
Order.args = {
  children: 'Order',
}
