"use client"

import { InfoCircledIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import DOMPurify from "isomorphic-dompurify"

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
  strings: string
  screenshot: string
  subResults: SubSearchResults
  highlight: Record<string, string[]>
}

export type SubSearchResults = {
  index: string
  windowTitle: string
  sourceType: string
  appName: string
  windowsAppId: string
  fallbackUri: string | null
  path: string
}

export const subSearchResultsMock: SubSearchResults = {
  index: "",
  windowTitle: "",
  sourceType: "",
  appName: "",
  windowsAppId: "",
  fallbackUri: "",
  path: "",
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
    accessorKey: "strings",
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
      const value = row.getValue("strings") as string
      const { selectedFields = [] } = useSidebar()

      return (
        <>
          <div className="flex h-full flex-col justify-between">
            {Object.keys(row.original.highlight).includes("strings") ? (
              <div
                className="flex-1"
                // Sanitized against XSS
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    !row.getIsExpanded() &&
                      row.original.highlight["strings"][0].length > 255
                      ? row.original.highlight["strings"][0].substring(0, 255) +
                          "..."
                      : row.original.highlight["strings"][0],
                    {
                      ALLOWED_TAGS: ["span"],
                      ALLOWED_ATTR: ["class"],
                    }
                  ),
                }}
              ></div>
            ) : (
              <div className="flex-1">
                {!row.getIsExpanded() && value.length > 255
                  ? value.substring(0, 255) + "..."
                  : value}
              </div>
            )}
            <div className="flex flex-wrap space-x-1 overflow-hidden">
              {selectedFields.map((key: string, index: number) => {
                // Get the value corresponding to the key from subResults
                const key_value =
                  row.original.subResults[key as keyof SubSearchResults]
                if (!key_value) return null
                return (
                  <div
                    className={`flex ${index === 0 ? "ml-1" : "before:content-['|']"} ${
                      index !== 0 ? "before:mr-1" : ""
                    }`}
                    key={key}
                  >
                    <div className="text-slate-500"> {key} = </div>
                    {Object.keys(row.original.highlight).includes(key) ? (
                      <div
                        className="ml-1"
                        // Sanitized against XSS
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            row.original.highlight[key][0],
                            {
                              ALLOWED_TAGS: ["span"],
                              ALLOWED_ATTR: ["class"],
                            }
                          ),
                        }}
                      ></div>
                    ) : (
                      <div className="ml-1">{key_value}</div>
                    )}
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
      if (Object.keys(row.original.highlight).includes("imageToken.keyword"))
        return (
          <div className="border-2 p-1 border-red-500">
            <Screenshot filePath={path} />
          </div>
        )
      return <Screenshot filePath={path} />
    },
  },
]
