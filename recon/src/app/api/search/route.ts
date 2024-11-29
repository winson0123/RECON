import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types'
import { NextRequest, NextResponse } from 'next/server'

import elasticClient from '@/backend/elastic'
import { SearchResults } from '@/components/table/columns'

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

export async function GET(req:NextRequest) {
    const searchParams = req.nextUrl.searchParams
    // TODO: Escape special characters in query
    let query = searchParams.get('query') || ''
    let indices = searchParams.get('indices')
    let fields = searchParams.get('fields')
    let dateStart = searchParams.get('dateStart')
    let dateEnd = searchParams.get('dateEnd')

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

    const searchQuery: QueryDslQueryContainer = {
      bool: {
        must: [({simple_query_string: {
          default_operator: 'AND',
          lenient: true,
          query: `${query}*`,
          fields: fields ? fields.split(',') : undefined,
          flags: 'ESCAPE|NOT|OR|PHRASE|PREFIX|WHITESPACE',
        }}) as QueryDslQueryContainer],
        filter: filterQuery,
      },
    }

    try {
      if (!process.env.ELASTIC_BASEURL) throw new Error("Invalid ELASTIC_BASEURL environment variable")
        const { hits } = await elasticClient.search<ElasticResponse>({
          index: indices ? indices.split(',') : '*',
          query: searchQuery,
          size: 10000,
          rest_total_hits_as_int: true,
          // sort: [{ 'timestamp': { order: 'desc' } }],
        })

      /* eslint-disable no-underscore-dangle */
      const results: SearchResults[] = hits.hits.map((hit) => ({
        id: hit._id!,
        time: hit._source!.timestamp,
        string: hit._source!.strings,
        screenshot: `./uploads/${hit._index}/screenshots/${hit._source!.imageToken}`,
        subResults:{
          index: hit._index,
          window: hit._source!.windowTitle,
          sourcetype: "Text matches",
          appName: hit._source!.appName,
          windowsAppId: hit._source!.windowsAppId,
          fallbackUri: hit._source!.fallbackUri,
          path: hit._source!.path,
        }
      }))

      return NextResponse.json({ results, resultSize: hits.total })
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('failed to parse date field')
      ) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 500 })
      } else {
        return NextResponse.json(error, { status: 500 })
      }
    }
  }
