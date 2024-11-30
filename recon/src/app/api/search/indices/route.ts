import { NextResponse } from "next/server"

import elasticClient from "@/backend/elastic"

export async function GET() {
  const output = await elasticClient.cat.indices({ format: "json" })
  const indices_names = output.map(index => index.index)
  return NextResponse.json(indices_names)
}
