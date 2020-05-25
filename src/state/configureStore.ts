import { alias } from 'webext-redux'
import { configureStore, Store, getDefaultMiddleware } from '@reduxjs/toolkit'
import {
  persistStore,
  Persistor,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'

import aliases from './aliases'
import rootReducer from './reducers'

export type RootState = ReturnType<typeof rootReducer>

const middleware = [
  alias(aliases),
  ...getDefaultMiddleware<RootState>({
    serializableCheck: {
      // we need to disable these to prevent issues in conjunction with redux-persist
      // ref: https://github.com/rt2zz/redux-persist/issues/988
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  } as any),
]

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { logger } = require('redux-logger')
  middleware.push(logger)
}

export default ({
  persistence = true,
}: {
  persistence: boolean
}): { store: Store<RootState>; persistor?: Persistor } => {
  const store = configureStore({
    reducer: rootReducer,
    middleware,
  })

  if (persistence) {
    const persistor = persistStore(store)
    return { store, persistor }
  }

  return { store }
}
