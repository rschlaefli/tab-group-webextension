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

import rootReducer from './reducers'

export type RootState = ReturnType<typeof rootReducer>

export default ({ persistence = true }: any): { store: Store; persistor?: Persistor } => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: [
      ...getDefaultMiddleware<RootState>({
        serializableCheck: {
          // we need to disable these to prevent issues in conjunction with redux-persist
          // ref: https://github.com/rt2zz/redux-persist/issues/988
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      } as any),
    ] as const,
  })

  if (persistence) {
    const persistor = persistStore(store)
    return { store, persistor }
  }

  return { store }
}
