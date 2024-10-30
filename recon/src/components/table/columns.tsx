"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// Define the shape of our data.
export type SearchResults = {
  id: string
  time: string
  string: string
  screenshot: string
  subRows: SubSearchResults
}

export type SubSearchResults = {
  uploadedBy: string // New fields for expanded data
  username: string
  guid: string
}

export const columns: ColumnDef<SearchResults>[] = [
  {
    id: "expand",
    cell: ({ row }) => {
      return (
        <div className="cursor-pointer" onClick={() => row.toggleExpanded()}>
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "time",
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
  },
  {
    accessorKey: "string",
    header: ({ column }) => (
      <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
        String
        {column.getIsSorted() === "asc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUpDown className="ml-2 h-4 w-4" />
        )}
      </Button>
    ),
  },
  {
    accessorKey: "screenshot",
    header: "Screenshot",
  },
]
