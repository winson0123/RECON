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
import Image from "next/image"

import { Button } from "@/components/ui/button"

// Define the shape of our data.
export type SearchResults = {
  id: string
  time: string
  string: string
  screenshot: string
  window: string
  host: string
  source: string
  sourcetype: string
}

export type SubSearchResults = {
  uploadedBy: string // New fields for expanded data
  username: string
  guid: string
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
      return (
        <>
          <div className="flex h-full flex-col justify-between">
            <div className="flex-1">
              {!row.getIsExpanded() && value.length > 255
                ? value.substring(0, 255) + "..."
                : value}
            </div>
            <div className="flex flex-wrap space-x-1 overflow-hidden">
              <div className="ml-1 flex">
                <div className="text-slate-500"> host = </div>
                <div className="ml-1">{row.original.host}</div>
              </div>
              <div className="flex before:content-['|']">
                <div className="text-slate-500 before:mr-1">window =</div>
                <div className="ml-1">{row.original.window}</div>
              </div>
              <div className="flex before:content-['|']">
                <div className="text-slate-500 before:mr-1">source = </div>
                <div className="ml-1">{row.original.source}</div>
              </div>
              <div className="flex before:content-['|']">
                <div className="text-slate-500 before:mr-1">sourcetype = </div>
                <div className="ml-1">{row.original.sourcetype}</div>
              </div>
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
      const url = row.getValue("screenshot") as string

      return (
        <div className="flex transform justify-center hover:scale-105 hover:transition-transform hover:duration-200">
          <Image
            className="rounded-lg"
            src={url}
            alt="Screenshot"
            width={200} // in px
            height={200} // in px
          />
        </div>
      )
    },
  },
]
