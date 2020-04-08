import React from 'react'

import { Provider } from 'react-redux'
import { Store, applyMiddleware } from 'webext-redux'
import { hasExtensionContext } from './utils'
import thunkMiddleware from 'redux-thunk'

/**
 * Wrap a given React component in a Redux provider using a webext-redux ProxyStore
 * @param Component a React component to wrap
 */
export default async function withProxyStore(Component: React.FC): Promise<React.ReactElement> {
  if (hasExtensionContext()) {
    // if we are in a webextension context, use a proxy store
    const proxyStore = new Store({
      state: {},
      portName: 'tabGrouping'
    })

    // apply middleware
    const middleware = [thunkMiddleware]
    const storeWithMiddleware = applyMiddleware(proxyStore, ...middleware)

    return proxyStore.ready().then(() => {
      return (
        <Provider store={storeWithMiddleware}>
          <Component />
        </Provider>
      )
    })
  }

  // if we are outside of webextension, use the redux store directly
  const configureStore = (await import('../state/configureStore')).default
  const { store } = configureStore({ persistence: false })
  return (
    <Provider store={store}>
      <Component />
    </Provider>
  )
}
