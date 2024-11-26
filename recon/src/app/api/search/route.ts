import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types'
import { NextRequest, NextResponse } from 'next/server'

import elasticClient from '@/backend/elastic'
import { SearchResults } from '@/components/table/columns'
import searchFields from '@/features/search/searchFields'

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
    let fields = searchParams.getAll('fields') || []
    let dateStart = searchParams.get('dateStart')
    let dateEnd = searchParams.get('dateEnd')

    const createdAtRange = {
      timestamp: {
        time_zone: '+08:00',
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
          fields: fields.length
            ? fields.map(
                (field) => `${searchFields[field as keyof typeof searchFields]}`,
              )
            : undefined,
          flags: 'ESCAPE|NOT|OR|PHRASE|PREFIX|WHITESPACE',
        }}) as QueryDslQueryContainer],
        filter: filterQuery,
      },
    }

    try {
      if (!process.env.ELASTIC_BASEURL) throw new Error("Invalid ELASTIC_BASEURL environment variable")
        const { hits } = await elasticClient.search<ElasticResponse>({
          index: '*',
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
          host: hit._index,
          window: hit._source!.windowTitle,
          source: hit._index,
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
