import FileTypeDetector from "detect-file-type-lite"
import jszip from "jszip"
import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import sqlite3 from "sqlite3"

import elasticClient from "@/backend/elastic"
import prisma from "@/backend/prisma"

const fileTypeDetector = new FileTypeDetector()

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const indexName = formData.get("index_name") as string
    const dbFile = formData.get("db_file") as File
    const ssFile = formData.get("ss_file") as File
    if (!indexName) {
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

    // Check if index already exists
    if (await prisma.recallIndex.findUnique({ where: { indexName } })) {
      return NextResponse.json({
        status: "fail",
        error: "Index name already exists",
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
      .mkdir(`./uploads/${indexName}/screenshots`, { recursive: true })
      .catch(console.error)
    await fs.writeFile(`./uploads/${indexName}/${dbFile.name}`, dbBuffer)
    await jszip.loadAsync(ssArrayBuffer).then((zip) => {
      Object.keys(zip.files).forEach((filename) => {
        zip.files[filename].async("nodebuffer").then((fileData) => {
          fs.writeFile(
            `./uploads/${indexName}/screenshots/${filename}`,
            fileData
          )
        })
      })
    })

    // Processing the valuable information from the ukg.db database file
    // and storing it in postgres, then indexing to elasticsearch.
    const databaseDump = await dumpDatabase(
      `./uploads/${indexName}/${dbFile.name}`
    )
    await insertPrisma(indexName, databaseDump)
    await indexDataToElasticsearch(indexName, databaseDump)

    return NextResponse.json({ status: "success" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}

async function dumpDatabase(dbPath: string) {
  // Promisify database operations
  const runQuery = (query: string): Promise<any[]> =>
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

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
          (
          SELECT DISTINCT
              ca.c0 AS c0, 
              cb.c2 AS c2
          FROM 
              WindowCaptureTextIndex_content ca
          LEFT JOIN 
              WindowCaptureTextIndex_content cb 
          ON 
              ca.c0 = cb.c0
          WHERE 
              ca.c1 IS NOT NULL AND cb.c2 IS NOT NULL
          ) wctic ON wc.Id = wctic.c0
      LEFT JOIN
          WindowCaptureAppRelation wcar ON wc.Id = wcar.WindowCaptureId
      LEFT JOIN
          App app ON wcar.AppId = app.Id
      WHERE 
          wc.ImageToken IS NOT NULL;
    `
    const rowResults = await runQuery(query)
    console.log("Database dump successful")

    return rowResults // Return the important information
  } catch (e) {
    console.error("Error dumping database:", e)
    throw e // Rethrow the error for caller to handle
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) console.error("Error closing database:", err.message)
    })
  }
}

async function insertPrisma(indexName: string, rowResults: any[]) {
  // Create a new RecallIndex
  const recallIndex = await prisma.recallIndex.create({
    data: { indexName },
  })

  // Insert rows into Prisma's Capture model
  for (const row of rowResults) {
    await prisma.capture.create({
      data: {
        timestamp: new Date(row.TimeStamp), // Ensure valid Date conversion
        imageToken: row.ImageToken,
        appName: row.AppName,
        windowTitle: row.WindowTitle,
        strings: row.Strings || null,
        windowsAppId: row.WindowsAppId,
        fallbackUri: row.FallbackUri || null,
        path: row.Path,
        recallIndex: {
          connect: { indexId: recallIndex.indexId }, // Link to the existing RecallIndex
        },
      },
    })
  }
  console.log("Database dump inserted into Prisma")
}

// Index data into Elasticsearch
async function indexDataToElasticsearch(indexName: string, rowResults: any[]) {
  try {
    // Prepare the bulk data for Elasticsearch
    const body = rowResults.flatMap((doc) => [
      { index: { _index: indexName } },
      {
        timestamp: doc.TimeStamp,
        imageToken: doc.ImageToken,
        appName: doc.AppName,
        windowTitle: doc.WindowTitle,
        strings: doc.Strings || null,
        windowsAppId: doc.WindowsAppId,
        fallbackUri: doc.FallbackUri || null,
        path: doc.Path,
      },
    ])

    // Bulk index data
    await elasticClient.bulk({ refresh: true, body })
    console.log("Database dump indexed into Elasticsearch")
  } catch (e) {
    console.error("Error indexing data into Elasticsearch:", e)
    throw e
  }
}
