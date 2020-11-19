import React from 'react'
import InlineInput from './InlineInput'

const story = {
  title: 'Component/InlineInput',
  component: InlineInput,
  argTypes: {
    label: {
      control: 'name',
    },
    type: 'text',
    placeholder: 'name',
    postLabel: 'name',
  },
}

export default story

const Template = (args) => <InlineInput {...args} />

export const Number = Template.bind({})
Number.args = {
  label: 'Price',
  type: 'number',
  placeholder: 'entry price',
  postLabel: 'USDT',
}
