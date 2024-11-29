import apiSlice from "@/app/api/apiSlice"
import { SearchResults } from "@/components/table/columns"

export interface SearchParams {
  query: string
  indices?: string
  fields?: string
  dateStart?: string
  dateEnd?: string
}
interface SearchResponse<T> {
  results: T[]
  resultSize: number
}

interface ScreenshotParams {
  path: string
}

interface ScreenshotResponse {
  base64: string
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchElastic: builder.query<SearchResponse<SearchResults>, SearchParams>({
      query: ({ query, indices, fields, dateStart, dateEnd }) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.append("query", query)
        if (indices) urlParams.append("indices", indices)
        if (fields) urlParams.append("fields", fields)
        if (dateStart) urlParams.append("dateStart", dateStart)
        if (dateEnd) urlParams.append("dateEnd", dateEnd)
        return `search?${urlParams}`
      },
    }),
    getIndices: builder.query<string[], null>({
      query: () => {
        return 'search/indices'
      },
    }),
    getScreenshot: builder.query<ScreenshotResponse, ScreenshotParams>({
      query: ({ path }) => {
        return `screenshot?path=${path}`
      },
    }),
  }),
  overrideExisting: false,
})

export const { useSearchElasticQuery, useGetIndicesQuery, useGetScreenshotQuery } = searchApi
