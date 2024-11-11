"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { Textarea } from "@/components/ui/textarea"


export default function SearchBar() {
  const router = useRouter()

  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
// Reset height to auto to recalculate the new height
      textareaRef.current.style.height = "auto"
// Set height to scrollHeight to adjust based on content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue]) // Effect runs when inputValue changes

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      console.log("Search submitted:", inputValue)
      // TODO: Clear the input after submitting (for now)
      // TODO: Change to search via elasticsearch API queries
      router.push(`/search?query=${encodeURIComponent(inputValue)}`, { scroll: false })
      setInputValue("")
    }
  }

  return (
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
        onBlur={handleBlur}
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
  )
}
