import React from 'react'
import ReactDOM from 'react-dom'

import withProxyStore from './lib/withProxyStore'
import Tutorial from './pages/Tutorial'

//load tailwind styling and reset css
import './styles/tailwind.css'

// import basic webextension styling
import 'webext-base-css/webext-base.css'

withProxyStore(Tutorial).then((component: React.ReactElement) => {
  ReactDOM.render(component, document.getElementById('root'))
})
