"use client"

import { InfoCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import Screenshot from "./screenshot"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

// Define the shape of our data.
export type SearchResults = {
  id: string
  time: number
  string: string
  screenshot: string
  subResults: SubSearchResults
}

export type SubSearchResults = {
  index: string
  window: string
  sourcetype: string
  appName: string
  windowsAppId: string
  fallbackUri: string | null
  path: string
}

export const subSearchResultsMock: SubSearchResults = {
  index: "",
  window: "",
  sourcetype: "",
  appName: "",
  windowsAppId: "",
  fallbackUri: "",
  path: ""
}

export const columns: ColumnDef<SearchResults>[] = [
  {
    id: "expand",
    header: ({}) => <InfoCircledIcon />,
    cell: ({ row }) => {
      return (
        <>
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </>
      )
    },
  },
  {
    accessorKey: "time",
    size: 120,
    header: ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        Time
        {column.getIsSorted() === "asc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue("time") as number
      const date = new Date(timestamp)
      return date.toLocaleString()
    },
  },
  {
    accessorKey: "string",
    header: ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        Strings captured
        {column.getIsSorted() === "asc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("string") as string
      const { selectedFields = [] } = useSidebar()

      return (
        <>
          <div className="flex h-full flex-col justify-between">
            <div className="flex-1">
              {!row.getIsExpanded() && value.length > 255
                ? value.substring(0, 255) + "..."
                : value}
            </div>
            <div className="flex flex-wrap space-x-1 overflow-hidden">
              {selectedFields.map((key: string, index: number) => {
                // Get the value corresponding to the key from subResults
                const key_value =
                  row.original.subResults[key as keyof SubSearchResults]
                return (
                  <div
                    className={`flex ${index === 0 ? "ml-1" : "before:content-['|']"} ${
                      index !== 0 ? "before:mr-1" : ""
                    }`}
                    key={key}
                  >
                    <div className="text-slate-500"> {key} = </div>
                    <div className="ml-1">{key_value}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )
    },
  },
  {
    accessorKey: "screenshot",
    size: 250,
    header: "Screenshot Preview",
    cell: ({ row }) => {
      const path = row.getValue("screenshot") as string
      return <Screenshot filePath={path}/>
    },
  },
]
