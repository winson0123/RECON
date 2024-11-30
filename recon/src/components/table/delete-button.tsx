"use client"

import { Button } from "@/components/ui/button"
import React from "react"

export default function DeleteButton({ id, setLoading, setData }) {
  const handleDelete = async () => {
    try {
        setLoading(true)
      const response = await fetch(`/api/data/index/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`)
      }
      await fetch("/api/data/index")
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
    } catch (error) {
      console.error("Error deleting index:", error)
    }
  }

  return (
    <div>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
