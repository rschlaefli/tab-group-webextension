import React from 'react'
import ReactDOM from 'react-dom'

import withProxyStore from './lib/withProxyStore'
import UI from './pages/UI'

//load tailwind styling and reset css
import './styles/tailwind.css'

withProxyStore(UI).then((component: React.ReactElement) => {
  ReactDOM.render(component, document.getElementById('root'))
})
