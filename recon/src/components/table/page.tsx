"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { columns } from "./columns"
import { DataTable } from "./data-table"

import { useSearchElasticQuery } from "@/features/search/searchSlice"

export default function DemoPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<string>("")

  useEffect(() => {
    const queryParam = searchParams.get("query")
    setQuery(queryParam ?? "")
  }, [searchParams])

  // Load everything onto client side for easier pagination and sorting.
  // Future enhancement: Server-side pagination and sorting, only required if search result set is too big which is unlikely at this stage.
  const { data, isLoading, isFetching, isError } = useSearchElasticQuery({
    query,
  })

  if (isLoading || isFetching) return <p className="text-center">Loading...</p>

  if (isError) {
    return <p className="text-center">Something went wrong</p>
  }

  if (!data?.results?.length)
    return <p className="text-center">No matching submissions found</p>

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data.results} />
    </div>
  )
}
