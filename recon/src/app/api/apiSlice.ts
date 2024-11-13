import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// TODO: Should we use next-redux-wrapper?

const apiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: [],
  endpoints: () => ({}),
})

export default apiSlice
