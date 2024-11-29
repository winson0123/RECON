"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { useGetIndicesQuery } from "@/app/api/searchSlice"
import { Textarea } from "@/components/ui/textarea"

const fieldsOptions = [
  "appName",
  "windowTitle",
  "strings",
  "windowsAppId",
  "fallbackUrl",
  "path",
]

export default function SearchBar() {
  const router = useRouter()

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [selectedIndices, setSelectedIndices] = useState<string[]>([])
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
      if (selectedIndices.length > 0)
        urlParams.append("indices", selectedIndices.join(","))
      if (selectedFields.length > 0)
        urlParams.append("fields", selectedFields.join(","))
      if (dateStart) urlParams.append("dateStart", dateStart)
      if (dateEnd) urlParams.append("dateEnd", dateEnd)
      router.push(`/?${urlParams}`, { scroll: false })
      // setInputValue("")
      // setSelectedFields([])
      // setDateStart("")
      // setDateEnd("")
    }
  }

  const toggleIndex = (index: string) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((f) => f !== index) : [...prev, index]
    )
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
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
            <h4 className="font-semibold">Index:</h4>
            <div className="flex flex-wrap">
              {indices &&
                indices.map((index) => (
                  <label key={index} className="mr-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIndices.includes(index)}
                      onChange={() => toggleIndex(index)}
                      className="mr-1"
                    />
                    {index}
                  </label>
                ))}
            </div>
          </div>
          <div className="mb-2">
            <h4 className="font-semibold">Search Within:</h4>
            {fieldsOptions.map((field) => (
              <label key={field} className="block">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={() => toggleField(field)}
                />
                {field}
              </label>
            ))}
          </div>
          <div className="mb-2">
            <h4 className="font-semibold">Date Range:</h4>
            <div className="mb-1 flex items-center">
              <label className="mr-2 min-w-12">
                From:
              </label>
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
              <label className="mr-2 min-w-12">
                To:
              </label>
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
        </div>
      )}
    </div>
  )
}
