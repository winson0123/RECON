"use client"

import { useState } from "react"
import Image from "next/image"

import { useGetScreenshotQuery } from "@/app/api/searchSlice"

interface ScreenshotProps {
  filePath: string // The server file path
}

const Screenshot: React.FC<ScreenshotProps> = ({ filePath }) => {
  const { data: base64Image } = useGetScreenshotQuery({
    path: filePath,
  })
  const [isEnlarged, setIsEnlarged] = useState(false)

  if (!base64Image?.base64) return <></>

  return (
    <>
      <div className="flex transform justify-center hover:scale-105 hover:transition-transform hover:duration-200">
        <Image
          className="cursor-pointer rounded-lg"
          src={`data:image/jpg;base64,${base64Image.base64}`}
          alt="Screenshot"
          width={200}
          height={200}
          onClick={() => setIsEnlarged(true)}
        />
      </div>

      {isEnlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setIsEnlarged(false)}
        >
          <Image
            className="cursor-pointer rounded-lg"
            src={`data:image/jpg;base64,${base64Image.base64}`}
            alt="Enlarged Screenshot"
            width={1200}
            height={1200}
          />
        </div>
      )}
    </>
  )
}

export default Screenshot
