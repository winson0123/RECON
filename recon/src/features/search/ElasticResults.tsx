"use client"

import { skipToken } from '@reduxjs/toolkit/query/react'
import { useState } from 'react'

import DemoPage from "@/components/table/page"
import { useSearchElasticQuery } from '@/features/search/searchSlice'

interface Props {
  query: string
}

export default function ElasticResults({ query }: Props) {
  const [currentPage, setCurrentPage] = useState(1)  // TODO: pagination with setCurrentPage
  const pageSize = 10
  const from = (currentPage - 1) * pageSize
  const { data, isLoading, isFetching, isError } = useSearchElasticQuery(
    query
      ? {
          query,
          from: from.toString(),
        }
      : skipToken,
  )

  if (isLoading || isFetching) return <p className="text-center">Loading...</p>

  if (isError) {
    return <p className="text-center">Something went wrong</p>
  }

  if (!data?.results?.length)
    return <p className="text-center">No matching submissions found</p>

  return <DemoPage/>
}
