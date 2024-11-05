import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

export default function formatError(
  error: FetchBaseQueryError | SerializedError | Error | unknown,
): string {
  if (error instanceof Error) {
    return error.toString()
  }
  if (typeof error === 'object' && 'status' in error) {
    const { status, data } = error
    if (
      status === 'FETCH_ERROR' ||
      status === 'PARSING_ERROR' ||
      status === 'CUSTOM_ERROR'
    ) {
      const { error: err } = error
      if (data && typeof data === 'string') {
        return `${err}: ${data}`
      }
      return err
    }
    if (data && typeof data === 'object') {
      if ('error' in data) {
        const { error: message } = data
        return `Error ${status}: ${message}`
      }
    }
  }
  return JSON.stringify(error)
}