import React from 'react'
import Input from './Input'

const story = {
  title: 'Component/Input',
  component: Input,
  argTypes: {
    label: 'label',
    type: 'text',
    icon: 'name',
    placeholder: 'name',
  },
}

export default story

const Template = (args) => <Input {...args} />

export const Text = Template.bind({})
Text.args = {
  label: 'Email',
  type: 'text',
  placeholder: 'erik@example.com',
}

export const Password = Template.bind({})
Password.args = {
  label: 'Password',
  type: 'password',
  placeholder: 'Password',
}

export const Number = Template.bind({})
Number.args = {
  label: 'Price',
  type: 'number',
  placeholder: 'Price',
  inlineLabel: true,
  subLabel: 'USDT',
}
