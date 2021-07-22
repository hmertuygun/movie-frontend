import React from 'react'
import Typography from './Typography'

const typography = ['h1', 'h2', 'h3', 'h4', 'p', 'span']
const colors = ['default', 'primary', 'error', 'warning', 'secondary']

const story = {
  title: 'Component/Typography',
  component: Typography,
  argTypes: {
    as: {
      description: 'What elements can we do types for',
      control: {
        type: 'select',
        options: [...typography],
      },
    },
    color: {
      description: 'the colors yo',
      control: {
        type: 'select',
        options: [...colors],
      },
    },
    children: 'text',
  },
}

export default story

const Template = (args) => <Typography {...args} />

export const Text = Template.bind({})
Text.args = {
  as: 'h1',
  children: 'Coinpanel trading panel',
}

export const Paragraph = Template.bind({})
Paragraph.args = {
  as: 'p',
  color: colors[0],
  children: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
}

export const Heading1 = Template.bind({})
Heading1.args = {
  as: 'h1',
  children: 'Coinpanel trading panel',
}

export const Heading2 = Template.bind({})
Heading2.args = {
  as: 'h2',
  children: 'Coinpanel trading panel',
}

export const Heading3 = Template.bind({})
Heading3.args = {
  as: 'h3',
  children: 'Coinpanel trading panel',
}
