import apiSlice from "@/app/api/apiSlice"
import { SearchResults } from "@/components/table/columns"

export interface SearchParams {
  query: string
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
      query: ({ query }) => {
        const urlParams = new URLSearchParams()
        if (query) urlParams.append("query", query)
        return `search?${urlParams}`
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

export const { useSearchElasticQuery, useGetScreenshotQuery } = searchApi
