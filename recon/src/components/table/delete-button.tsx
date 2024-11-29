"use client"

import { Button } from "@/components/ui/button"
import React from "react"

export default function DeleteButton({ id }) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/data/index/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Delete successful:", data)
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
