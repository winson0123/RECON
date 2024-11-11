import FileTypeDetector, { FileTypeResult } from "detect-file-type-lite"
import jszip from "jszip"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import fs from "node:fs/promises"

const fileTypeDetector = new FileTypeDetector()

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const index = formData.get("index") as String
    const dbFile = formData.get("db_file") as File
    const ssFile = formData.get("ss_file") as File
    if (!index) {
      return NextResponse.json({
        status: "fail",
        error: "An index is required",
      })
    } else if (typeof dbFile !== "object") {
      return NextResponse.json({
        status: "fail",
        error: "A Database File is required",
      })
    } else if (typeof ssFile !== "object") {
      return NextResponse.json({
        status: "fail",
        error: "A snapshot file (zip) is required",
      })
    }
    const dbArrayBuffer = await dbFile.arrayBuffer()
    const ssArrayBuffer = await ssFile.arrayBuffer()
    const dbBuffer = new Uint8Array(dbArrayBuffer)
    const ssBuffer = new Uint8Array(ssArrayBuffer)

    const dbFileType = (await fileTypeDetector.fromBuffer(dbBuffer)) || {
      ext: "",
    }
    const ssFileType = (await fileTypeDetector.fromBuffer(ssBuffer)) || {
      ext: "",
    }
    if (dbFileType?.ext !== "sqlite") {
      return NextResponse.json({
        status: "fail",
        error: "The DB file must be an SQLite (.db) file",
      })
    } else if (ssFileType?.ext !== "zip") {
      return NextResponse.json({
        status: "fail",
        error: "The Screenshot file must be a zip (.zip) file",
      })
    }

    await fs
      .mkdir(`./tmp/uploads/${index}/screenshots`, { recursive: true })
      .catch(console.error)
    await fs.writeFile(`./tmp/uploads/${index}/${dbFile.name}`, dbBuffer)
    await jszip.loadAsync(ssArrayBuffer).then((zip) => {
      Object.keys(zip.files).forEach((filename) => {
        zip.files[filename].async("string").then((fileData) => {
          fs.writeFile(
            `./tmp/uploads/${index}/screenshots/${filename}`,
            fileData
          )
        })
      })
    })

    revalidatePath("/")

    return NextResponse.json({ status: "success" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}
