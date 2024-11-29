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

    let imageTokenMapping: Record<string, string[]> = {}  // mapping of index to uuids
    if (query && (!fields || fields.split(',').includes("Semantic search for objects in screenshots"))) {
      const response = await fetch(`http://recon_model:8000/search/?object=${encodeURIComponent(query)}`)
      imageTokenMapping = await response.json()
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

    const shouldQueries: QueryDslQueryContainer[] = []

    // Text Query
    shouldQueries.push({
      simple_query_string: {
        default_operator: 'AND',
        lenient: true,
        query: `${query}*`,
        fields: fields ? fields.split(',') : undefined,
        flags: 'ESCAPE|NOT|OR|PHRASE|PREFIX|WHITESPACE',
      },
    })

    // Semantic search for objects in screenshots
    for (const [index, imageTokens] of Object.entries(imageTokenMapping)) {
      shouldQueries.push({
        bool: {
          must: [
            {
              terms: {
                'imageToken.keyword': imageTokens, 
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

    const searchQuery: QueryDslQueryContainer = {
      bool: {
        should: shouldQueries,
      },
    }
    
    try {
      if (!process.env.ELASTIC_BASEURL) throw new Error("Invalid ELASTIC_BASEURL environment variable")
        const { hits } = await elasticClient.search<ElasticResponse>({
          index: indices ? indices.split(',') : '*',
          query: searchQuery,
          size: 10000,
          rest_total_hits_as_int: true,
          highlight: {
            encoder: 'html',
            pre_tags: ['<span class="font-bold">'],
            post_tags: ['</span>'],
            fields: {
              '*': {
                number_of_fragments: 0,
              },
            },
          },
          // sort: [{ 'timestamp': { order: 'desc' } }],
        })

      const results: SearchResults[] = hits.hits.map((hit) => {
        let sourceType: string
        const highlightKeys = hit.highlight ? Object.keys(hit.highlight): []
        if (highlightKeys.length === 0) sourceType = ''
        else if (highlightKeys.includes('imageToken.keyword'))
          sourceType = highlightKeys.length === 1 ? 'Image Match' : 'Text and Image Match'
        else sourceType = 'Text Match'
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
          highlight: hit.highlight!
        }
      })

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
