import { NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import prisma from "@/backend/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    const result = await prisma.recallIndex.findUnique({
      select: {
        indexId: true,
        indexName: true,
        _count: {
          select: {
            captures: true,
          },
        },
      },
      where: {
        indexId: Number(id),
      },
    })
    if (result) {
      const {
        indexId,
        indexName,
        _count: { captures },
      } = result
      return NextResponse.json({
        id: indexId,
        name: indexName,
        captures: captures,
      })
    } else {
      return NextResponse.json({
        status: "fail",
        error: "Index with that ID does not exist.",
      })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }
    const check = await prisma.recallIndex.findUnique({
      select: {
        indexId: true,
        indexName: true,
        _count: {
          select: {
            captures: true,
          },
        },
      },
      where: {
        indexId: Number(id),
      },
    })
    if (check) {
      const result = await prisma.recallIndex.delete({
        where: {
          indexId: Number(id),
        },
      })
      const { indexName } = result
      fs.rmdir(`./uploads/${indexName}`, { recursive: true })
      return NextResponse.json({
        status: "success",
        message: `Index ${indexName} has been successfully deleted.`,
      })
    } else {
      return NextResponse.json({
        status: "fail",
        error: "Index with that ID does not exist.",
      })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ status: "fail", error: e })
  }
}
