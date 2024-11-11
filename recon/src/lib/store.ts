import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit'
import type { Middleware } from '@reduxjs/toolkit'

import apiSlice from '@/app/api/apiSlice'


const rtkQueryErrorLogger: Middleware = (_api) => (next) => (action) => {
  if (isRejectedWithValue(action)) {
  }

  return next(action)
}

export const makeStore = () => {
  return configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload'],
        ignoredPaths: [/api\.queries\.getSubmissionFile\(\d+\)\.data/],
      },
    })
      .concat(rtkQueryErrorLogger)
      .concat(apiSlice.middleware),
})
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
