import React from 'react'
import ReactDOM from 'react-dom'

import Data from './pages/Data'

//load tailwind styling and reset css
import './styles/tailwind.css'

// import basic webextension styling
import 'webext-base-css/webext-base.css'

ReactDOM.render(<Data />, document.getElementById('root'))
