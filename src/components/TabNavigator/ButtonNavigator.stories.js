import React from 'react'
import ButtonNavigator from './ButtonNavigator'

const story = {
  title: 'Component/ButtonNavigator',
  component: ButtonNavigator,
  argTypes: {},
}

export default story

const Template = (args) => (
  <ButtonNavigator>
    <div>1. Child One</div>
    <div>2. Child Two</div>
  </ButtonNavigator>
)

export const Default = Template.bind({})
Default.args = {
  labelArray: ['Place Order', 'Full Trade'],
  index: 0,
}
