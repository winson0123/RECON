"use client"

import * as React from "react"
import { useEffect, useState, useRef, useMemo } from "react"
import formatError from "@/app/api/common/formatError"
import { CloudUpload, File, Trash2 } from "lucide-react"
import notification, { Notification } from "@/components/ui/notification"

export default function Upload() {
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const fileDropBoxEl = useRef<HTMLDivElement>(null)
  const fileDropBoxHeight = useMemo(
    () =>
      `calc(100vh - 134px - ${`${
        fileDropBoxEl.current?.getBoundingClientRect().height ?? 0
      }px`})`,
    [fileDropBoxEl]
  )
  const fileDropBoxStyle = {
    height: `${fileDropBoxHeight}`,
  }

  // Handle file input from drag and drop
  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.stopPropagation()
      event.preventDefault()
      setDragging(true)
    }
    const handleDragLeave = (event: DragEvent) => {
      event.stopPropagation()
      event.preventDefault()
      const dropzone = document.getElementById("dropzone")
      if (!dropzone?.contains(event.relatedTarget as Node)) setDragging(false)
    }
    const onDrop = (event: DragEvent) => {
      handleDragLeave(event)
      if (
        event.dataTransfer?.files &&
        event.dataTransfer.files.length > 0 &&
        fileInput.current
      ) {
        fileInput.current.files = event.dataTransfer.files
      }
    }

    const dropzone = document.getElementById("dropzone")
    dropzone?.addEventListener("dragover", handleDragOver)
    dropzone?.addEventListener("dragleave", handleDragLeave)
    dropzone?.addEventListener("drop", onDrop)
    return () => {
      dropzone?.removeEventListener("dragover", handleDragOver)
      dropzone?.removeEventListener("dragleave", handleDragLeave)
      dropzone?.removeEventListener("drop", onDrop)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function uploadFile(
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    evt.preventDefault()

    const formData = new FormData()
    formData.append("file", fileInput?.current?.files?.[0]!)

    const response = await fetch("/api/data/upload", {
      method: "POST",
      body: formData,
    })
    const result = await response.json()
    // TODO: toast popup on successful upload
    // if (result.status == "success") {
    //   console.log(result.status)
    //   notification({
    //     message: {
    //       message:
    //         'File uploaded',
    //       notificationEmitter: 'New Upload',
    //     },
    //     type: Notification.Success,
    //   })
    //   // TODO: redirect after successful upload
    //   // router.push('/')
    // }
  }

  return (
    <form
      id="dropzone"
      className={`m-8 w-full content-center ${
        dragging
          ? "rounded-3xl border border-solid bg-gray-800"
          : "bg- rounded-3xl border-4 border-dashed border-blue-400"
      } transition duration-300`}
      style={fileDropBoxStyle}
    >
      <div className="">
        <div className="mx-auto h-32 w-32">
          <CloudUpload className="h-32 w-32" />
        </div>
        <div className="mx-auto w-96">
          <h1 className="align-center flex justify-center font-bold">
            Upload a file
          </h1>
        </div>
        <div className="mx-auto max-w-64 py-8">
          <input id="fileinput" type="file" name="file" ref={fileInput} />
          {
            // TODO: Add delete button
            // fileInput?.current?.files &&
            //   fileInput?.current?.files.length > 0 && (
            //   <Trash2 color="#ff0000"/>
            //   )
          }
        </div>
      </div>
      <div className="flex items-end justify-center gap-2">
        <button
          className="border-1 mx-auto mb-0 flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-md border-transparent bg-gradient-to-r from-indigo-700 from-10% via-sky-700 via-80% to-sky-600 pl-1.5 text-lg normal-case shadow transition-all duration-200 ease-in-out hover:border-2 hover:border-sky-400 hover:from-indigo-900 hover:to-sky-900"
          type="submit"
          onClick={uploadFile}
        >
          <File className="block h-6 w-6" />
          <span>Submit</span>
        </button>
      </div>
    </form>
  )
}
