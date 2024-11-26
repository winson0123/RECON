"use client"

import Image from "next/image"

import { useGetScreenshotQuery } from "@/features/search/searchSlice"

interface ScreenshotProps {
  filePath: string // The server file path
}

const Screenshot: React.FC<ScreenshotProps> = ({ filePath }) => {
  const { data:base64Image } = useGetScreenshotQuery({
    path: filePath,
  })

  if (!base64Image?.base64)
    return <></>

  return (
    <div className="flex transform justify-center hover:scale-105 hover:transition-transform hover:duration-200">
      <Image
        className="rounded-lg"
        src={`data:image/jpg;base64,${base64Image.base64}`}
        alt="Screenshot"
        width={200} // in px
        height={200} // in px
      />
    </div>
  )
}

export default Screenshot
