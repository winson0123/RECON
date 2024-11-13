import apiSlice from "@/app/api/apiSlice"

export interface SearchParams {
  query: string
  from?: string
}

interface SearchResponse<T> {
  results: T[]
  resultSize: number
}

export interface ElasticResult {
  // TODO
  filename: string
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchElastic: builder.query<SearchResponse<ElasticResult>, SearchParams>({
      query: ({ query, from }) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.append('query', query)
        if (from && from !== '0') urlParams.append('from', from)
        return `search?${urlParams}`
      },
    }),
  }),
  overrideExisting: false,
})

export const { useSearchElasticQuery } = searchApi
