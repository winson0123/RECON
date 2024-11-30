"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { columns } from "./columns"
import { DataTable } from "./data-table"

import { useSearchElasticQuery } from "@/app/api/searchSlice"

export default function DemoPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState<string>("")
  const [selectedIndices, setSelectedIndices] = useState<string>("")
  const [selectedFields, setSelectedFields] = useState<string>("")
  const [dateStart, setDateStart] = useState<string>("")
  const [dateEnd, setDateEnd] = useState<string>("")

  useEffect(() => {
    const queryParam = searchParams.get("query")
    const selectedIndicesParam = searchParams.get("indices")
    const selectedFieldsParam = searchParams.get("fields")
    const dateStartParam = searchParams.get("dateStart")
    const dateEndParam = searchParams.get("dateEnd")
    setQuery(queryParam ?? "")
    setSelectedIndices(selectedIndicesParam ?? "")
    setSelectedFields(selectedFieldsParam ?? "")
    setDateStart(dateStartParam ?? "")
    setDateEnd(dateEndParam ?? "")
  }, [searchParams])

  // Load everything onto client side for easier pagination and sorting.
  // Future enhancement: Server-side pagination and sorting, only required if search result set is too big which is unlikely at this stage.
  const { data, isLoading, isFetching, isError } = useSearchElasticQuery({
    query,
    indices: selectedIndices,
    fields: selectedFields,
    dateStart,
    dateEnd,
  })

  if (isLoading || isFetching) return <p className="text-center">Loading...</p>

  if (isError) {
    return <p className="text-center">Something went wrong</p>
  }

  if (!data?.results?.length)
    return <p className="text-center">No matches found</p>

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data.results} />
    </div>
  )
}
