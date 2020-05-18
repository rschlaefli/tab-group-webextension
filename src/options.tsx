import React from 'react'
import ReactDOM from 'react-dom'

import Options from './pages/Options'

//load tailwind styling and reset css
import './styles/tailwind.css'

// import basic webextension styling
import 'webext-base-css/webext-base.css'

ReactDOM.render(<Options />, document.getElementById('root'))
