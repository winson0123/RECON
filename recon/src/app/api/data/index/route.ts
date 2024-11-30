import { NextRequest, NextResponse } from "next/server"
import prisma from "@/backend/prisma"

export async function GET(req: NextRequest) {
  try {
    const results = await prisma.recallIndex.findMany({
      select: {
        indexId: true,
        indexName: true,
        _count: {
          select: {
            captures: true,
          },
        },
      },
    })
    const formatted = results.map((result) => {
      const {
        indexId,
        indexName,
        _count: { captures },
      } = result
      return { id: indexId, name: indexName, captures: captures }
    })
    return NextResponse.json(formatted)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}
