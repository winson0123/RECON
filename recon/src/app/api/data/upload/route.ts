import FileTypeDetector from "detect-file-type-lite"
import jszip from "jszip"
import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import sqlite3 from "sqlite3"

const fileTypeDetector = new FileTypeDetector()

export async function POST(req: NextRequest) {
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

    // Processing the valuable information from the ukg.db database file
    // and storing it in postgres, then indexing to elasticsearch.
    const jsonDump = await dumpDatabase(`./tmp/uploads/${index}/${dbFile.name}`)

    return NextResponse.json({ status: "success" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}

async function dumpDatabase(dbPath: string): Promise<string> {
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

  // Promisify database operations
  const runQuery = (query: string): Promise<any[]> =>
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

  try {
    // Dump important information from database
    const query = `
      SELECT 
        wc.TimeStamp AS TimeStamp, 
        wc.ImageToken AS ImageToken, 
        app.Name AS AppName, 
        wc.WindowTitle AS WindowTitle, 
        wctic.c2 AS Strings, 
        app.WindowsAppId AS WindowsAppId, 
        wc.FallbackUri AS FallbackUri, 
        app.Path AS Path
      FROM
        WindowCapture wc
      LEFT JOIN
          WindowCaptureTextIndex_content wctic ON wc.Id = wctic.c0
      LEFT JOIN
          WindowCaptureAppRelation wcar ON wc.Id = wcar.WindowCaptureId
      LEFT JOIN
          App app ON wcar.AppId = app.Id
      WHERE wc.ImageToken IS NOT NULL;
    `
    const rowResults = await runQuery(query)

    // Convert rows to JSON
    const jsonDump = JSON.stringify(rowResults, null, 2)

    console.log("JSON Dump:")
    console.log(jsonDump)

    return jsonDump // Return the JSON-formatted string
  } catch (e) {
    console.error("Error dumping database:", e)
    throw e // Rethrow the error for caller to handle
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message)
      } else {
        console.log("Database connection closed.")
      }
    })
  }
}
