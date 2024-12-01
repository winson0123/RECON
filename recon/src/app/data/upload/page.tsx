"use client"

import { CloudUpload, File } from "lucide-react"
import * as React from "react"
import { useRef, useMemo } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function Upload() {
  const { toast } = useToast()
  const indexInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const fileInput2 = useRef<HTMLInputElement>(null)
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

  async function uploadFile(
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    evt.preventDefault()

    const indexValue = indexInput?.current?.value!

    if (!indexValue) {
      toast({
        variant: "destructive",
        title: "Error:",
        description: "The Index name field cannot be empty.",
      })
      return
    } else if (!/^[a-z0-9_.-]+$/.test(indexValue)) {
      toast({
        variant: "destructive",
        title: "Error:",
        description:
          "The Index name field can only include lowercase letters (a-z), numbers (0-9), underscores (_), hyphens (-), and periods (.). No spaces.",
      })
      return
    } else if (fileInput?.current?.files?.length == 0) {
      toast({
        variant: "destructive",
        title: "Error:",
        description: "The Database File field cannot be empty.",
      })
      return
    } else if (fileInput2?.current?.files?.length == 0) {
      toast({
        variant: "destructive",
        title: "Error:",
        description: "The Screenshots File field cannot be empty.",
      })
      return
    }

    const formData = new FormData()
    formData.append("index_name", indexInput?.current?.value!)
    formData.append("db_file", fileInput?.current?.files?.[0]!)
    formData.append("ss_file", fileInput2?.current?.files?.[0]!)

    const response = await fetch("/api/data/upload", {
      method: "POST",
      body: formData,
    })
    const result = await response.json()
    if (result.status == "success") {
      toast({
        title: "Upload:",
        description: "The upload completed successfully",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error:",
        description: `Something went wrong with the upload: ${result.error}`,
      })
    }
  }

  return (
    <form className={`m-8 content-center`} style={fileDropBoxStyle}>
      <div className="">
        <div className="mx-auto h-32 w-32">
          <CloudUpload className="h-32 w-32" />
        </div>
        <div className="mx-auto w-96 py-2">
          <h1 className="align-center flex justify-center font-bold">
            Upload a file
          </h1>
        </div>
        <div className="py-4">
          <div className="mx-auto w-96 content-center px-4 py-2">
            <Label htmlFor="picture">Index Name</Label>
            <Input type="text" ref={indexInput} />
          </div>
          <div className="mx-auto w-96 content-center px-4 py-2">
            <Label htmlFor="picture">DB File</Label>
            <Input type="file" ref={fileInput} />
          </div>
          <div className="mx-auto w-96 content-center px-4 py-2">
            <Label htmlFor="picture">Screenshots (Zip)</Label>
            <Input
              type="file"
              ref={fileInput2}
              accept="application/x-zip-compressed"
            />
          </div>
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
