import React from 'react'
import TabNavigator from './TabNavigator'

const story = {
  title: 'Component/TabNavigator',
  component: TabNavigator,
  argTypes: {
    labelArray: {
      value: [],
      requred: true,
    },
  },
}

export default story

const children = [<div>Hejje</div>, <div>Doo</div>, <div>Dooeee</div>]

const Template = (args) => <TabNavigator {...args} />

export const Default = Template.bind({})
Default.args = {
  labelArray: ['Place Order', 'Full Trade'],
  index: 0,
  children,
}
