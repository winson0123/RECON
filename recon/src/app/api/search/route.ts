import { QueryDslQueryContainer } from "@elastic/elasticsearch/lib/api/types"
import { NextRequest, NextResponse } from "next/server"

import elasticClient from "@/backend/elastic"
import { SearchResults } from "@/components/table/columns"

export interface ElasticResponse {
  timestamp: number
  imageToken: string
  appName: string
  windowTitle: string
  strings: string
  windowsAppId: string
  fallbackUri: string
  path: string
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  // TODO: Escape special characters in query
  let query = searchParams.get("query") || ""
  let dateStart = searchParams.get("dateStart")
  let dateEnd = searchParams.get("dateEnd")

  const screenshotRegex = /screenshot:(?:"([^"]*)"?|([^\s"]*))/

  let imageTokenMapping: Record<string, string[]> = {} // mapping of index to screenshot uuids
  const isSimpleQuery = !query.includes(":") // if it is a query without specifying of field names
  if (query == "") {
    // don't pass blank queries to image search
  } else if (isSimpleQuery) {
    const response = await fetch(
      `http://recon_model:8000/search/?object=${encodeURIComponent(query)}`
    )
    imageTokenMapping = await response.json()
  } else {
    const match = query.match(screenshotRegex)
    if (match) {
      const screenshotQuery = match[1] || match[2] // one of the regex capturing groups will be populated while the other will be blank based on whether quotation marks are used
      const response = await fetch(
        `http://recon_model:8000/search/?object=${encodeURIComponent(screenshotQuery)}`
      )
      query = query.replace(screenshotRegex, "")
      imageTokenMapping = await response.json()
    }
  }

  const createdAtRange = {
    timestamp: {
      gte: dateStart || undefined,
      lte: dateEnd || undefined,
    },
  }

  const filterQuery: QueryDslQueryContainer[] = [
    {
      range: createdAtRange,
    },
  ]

  // Text Query
  const textQuery = {
    query_string: {
      default_operator: "AND",
      lenient: true,
      query: query.trim()
        ? query.replaceAll("index:", "_index:") // simpler to specify index field
        : "*", // blank queries should return all results
    },
  } as QueryDslQueryContainer

  // Semantic search for objects in screenshots
  const imageQueries: QueryDslQueryContainer[] = []
  for (const [index, imageTokens] of Object.entries(imageTokenMapping)) {
    imageQueries.push({
      bool: {
        must: [
          {
            terms: {
              "imageToken.keyword": imageTokens,
            },
          },
        ],
        filter: [
          {
            term: {
              _index: index,
            },
          },
          ...filterQuery,
        ],
      },
    })
  }

  let searchQuery: QueryDslQueryContainer
  if (isSimpleQuery)
    searchQuery = { bool: { should: [textQuery, ...imageQueries] } }
  else if (query.trim())
    searchQuery = {
      bool: { must: [textQuery, { bool: { should: imageQueries } }] },
    }
  else searchQuery = { bool: { should: imageQueries } } // if only image field was specified but remaining query is blank. no resultant difference from previous if-statement but requires less processing

  try {
    if (!process.env.ELASTIC_BASEURL)
      throw new Error("Invalid ELASTIC_BASEURL environment variable")
    const { hits } = await elasticClient.search<ElasticResponse>({
      query: searchQuery,
      size: 10000,
      rest_total_hits_as_int: true,
      highlight: {
        encoder: "html",
        pre_tags: ['<span class="font-bold">'],
        post_tags: ["</span>"],
        fields: {
          "*": {
            number_of_fragments: 0,
          },
        },
      },
      // sort: [{ 'timestamp': { order: 'desc' } }],
    })

    const results: SearchResults[] = hits.hits.map((hit) => {
      let sourceType: string
      const highlightKeys = hit.highlight ? Object.keys(hit.highlight) : []
      if (highlightKeys.length === 0) sourceType = ""
      else if (highlightKeys.includes("imageToken.keyword"))
        sourceType =
          highlightKeys.length === 1 ? "Image Match" : "Text and Image Match"
      else sourceType = "Text Match"
      return {
        id: hit._id!,
        time: hit._source!.timestamp,
        strings: hit._source!.strings,
        screenshot: `./uploads/${hit._index}/screenshots/${hit._source!.imageToken}`,
        subResults: {
          index: hit._index,
          windowTitle: hit._source!.windowTitle,
          sourceType,
          appName: hit._source!.appName,
          windowsAppId: hit._source!.windowsAppId,
          fallbackUri: hit._source!.fallbackUri,
          path: hit._source!.path,
        },
        highlight: hit.highlight || {},
      }
    })

    return NextResponse.json({
      results,
      resultSize: hits.total,
      query: searchQuery,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("failed to parse date field")
    ) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 500 }
      )
    } else {
      return NextResponse.json(error, { status: 500 })
    }
  }
}
