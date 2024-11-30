import fs from "fs"
import { NextResponse } from "next/server"
import path from "path"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get("path")

  if (!filePath) {
    return NextResponse.json(
      { error: "File path is required" },
      { status: 400 }
    )
  }

  // Validation to prevent directory traversal attacks
  const absolutePath = path.resolve(filePath)
  const baseDir = path.join(process.cwd(), "./uploads")
  const pattern = new RegExp(`^${baseDir}/[^/]+/screenshots/[^/]+`);
  if (!pattern.test(absolutePath)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 403 })
  }

  try {
    const buffer = fs.readFileSync(filePath)
    const base64 = buffer.toString("base64")
    return NextResponse.json({ base64 })
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }
}
