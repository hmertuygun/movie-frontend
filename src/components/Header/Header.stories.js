import React from 'react'
import Header from './Header'
import { BrowserRouter as Router } from 'react-router-dom'

const story = {
  title: 'Component/Header',
  component: Header,
  argTypes: {},
}

export default story

const Template = (args) => (
  <Router>
    <Header></Header>
  </Router>
)

export const Default = Template.bind({})
Default.args = {}
