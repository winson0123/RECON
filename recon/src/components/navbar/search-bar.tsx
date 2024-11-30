"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useGetIndicesQuery } from "@/app/api/searchSlice"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip } from "@mui/material"

const fieldsOptions = [
  "appName",
  "windowTitle",
  "strings",
  "windowsAppId",
  "fallbackUrl",
  "path",
  "Semantic search for objects in screenshots",
]

export default function SearchBar() {
  const router = useRouter()

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [dateStart, setDateStart] = useState("")
  const [dateEnd, setDateEnd] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to recalculate the new height
      textareaRef.current.style.height = "auto"
      // Set height to scrollHeight to adjust based on content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue]) // Effect runs when inputValue changes

  const handleFocus = () => setIsFocused(true)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const urlParams = new URLSearchParams()
      if (inputValue) urlParams.append("query", inputValue)
      if (dateStart) urlParams.append("dateStart", dateStart)
      if (dateEnd) urlParams.append("dateEnd", dateEnd)
      router.push(`/?${urlParams}`, { scroll: false })
      // setInputValue("")
      // setSelectedFields([])
      // setDateStart("")
      // setDateEnd("")
    }
  }

  // Handle clicks outside of the dropdown and textarea
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const { data: indices } = useGetIndicesQuery(null)

  return (
    <div className="relative flex w-96 flex-col">
      <div className="relative flex items-center">
        <Search
          className={`absolute left-3 h-5 w-5 text-gray-400 transition-opacity duration-300 ease-in-out ${
            isFocused ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Textarea expands with content and removes padding when focused */}
        <Textarea
          className={`w-full resize-none transition-all duration-300 ease-in-out ${
            !isFocused ? "pl-10" : "pr-10" // Padding for the search icon when not focused
          }`}
          ref={textareaRef}
          value={inputValue}
          onFocus={handleFocus}
          onChange={handleChange}
          onKeyDown={handleKeyDown} // Handle submission on Enter
          rows={1}
          placeholder="Search"
        />

        <Search
          className={`absolute right-3 h-5 w-5 text-gray-400 transition-opacity duration-300 ease-in-out ${
            isFocused ? "opacity-100" : "opacity-0"
          }`}
          // TODO: onClick event to run search function
        />
      </div>

      {isFocused && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-10 mt-1 rounded border border-gray-300 bg-white p-4 shadow-lg"
          style={{ top: `${textareaRef.current?.offsetHeight}px` }} // Position below the textarea
        >
          <div className="mb-2">
            <h4 className="font-semibold">Date Range:</h4>
            <div className="mb-1 flex items-center">
              <label className="mr-2 min-w-12">From:</label>
              <input
                id="dateStart"
                type="datetime-local"
                onChange={(e) =>
                  setDateStart(`${new Date(e.target.value).getTime()}`)
                }
                className="mr-2 rounded border border-gray-300 p-1"
              />
            </div>
            <div className="flex items-center">
              <label className="mr-2 min-w-12">To:</label>
              <input
                id="dateEnd"
                type="datetime-local"
                onChange={(e) =>
                  setDateEnd(`${new Date(e.target.value).getTime()}`)
                }
                className="rounded border border-gray-300 p-1"
              />
            </div>
          </div>
          <div className="mb-2">
            <h4 className="font-semibold">How to use this search bar:</h4>
            <div className="border-b">
              <div className="flex items-center">
                <span>Use the Lucene query syntax</span>
                <Tooltip
                  title={
                    <>
                      <p>
                        the query is strict and returns an error if the query
                        string includes any invalid syntax
                      </p>
                      <p>
                        note that special characters need to be escaped with
                        backslash
                      </p>
                    </>
                  }
                >
                  <span className="ml-1 cursor-default select-none text-lg font-normal">
                    &#128712;
                  </span>
                </Tooltip>
              </div>
              <ul className="ml-4 list-disc text-sm text-gray-800">
                <li>
                  'AND' and 'OR' operators are not supported in conjunction with
                  image semantic search
                </li>
              </ul>
            </div>
            <div className="border-b">
              Available fields to specify in addition to those in the sidebar:
              <ul className="ml-4 list-disc text-sm text-gray-800">
                <li>strings</li>
                <li>screenshot</li>
              </ul>
            </div>
            <div>
              Example queries:
              <ul className="ml-4 list-disc text-sm text-gray-800">
                <li>
                  <a href="/?query=index:abc appName:'Microsoft Edge' strings:Google">
                    index:abc appName:"Microsoft Edge" strings:Google
                  </a>
                </li>
                <li>
                  <a href="/?query=screenshot:monkey">screenshot:monkey</a>
                </li>
              </ul>
            </div>
            <div className="border-b">
              Query matches will be bolded (black border for matching
              screenshots)
            </div>
          </div>
          <div className="mb-2">
            <h4 className="font-semibold">List of Indices:</h4>
            <div className="flex flex-wrap">
              {indices &&
                indices.map((index) => (
                  <span className="rounded border px-2 py-1">{index}</span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
