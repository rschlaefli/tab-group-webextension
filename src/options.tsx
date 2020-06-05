import React from 'react'
import ReactDOM from 'react-dom'

import withProxyStore from './lib/withProxyStore'
import Options from './pages/Options'

//load tailwind styling and reset css
import './styles/tailwind.css'

withProxyStore(Options).then((component: React.ReactElement) => {
  ReactDOM.render(component, document.getElementById('root'))
})
