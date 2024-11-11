import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types'
import { NextRequest, NextResponse } from 'next/server'

import elasticController from '@/backend/elastic'
import searchFields from '@/features/search/searchFields'
import { ElasticResult } from '@/features/search/searchSlice'

export interface ElasticResponse {
  filename: string
  highlight: Record<string, string[]>
}

export async function GET(req:NextRequest) {
    const searchParams = req.nextUrl.searchParams
    // TODO: Escape special characters in query
    let query = searchParams.get('query') || ''
    let from = searchParams.get('from') ? Number(searchParams.get('from')) : 0
    let fields = searchParams.getAll('fields') || []
    let dateStart = searchParams.get('dateStart')
    let dateEnd = searchParams.get('dateEnd')

    const createdAtRange = {
      createdAt: {
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
      const elasticClient = await elasticController.getElasticClient(process.env.ELASTIC_BASEURL)
        const { hits } = await elasticClient.search<ElasticResponse>({
        index: 'submission',
        query: searchQuery,
        size: 10,
        highlight: {
          encoder: 'html',
          pre_tags: ['<span class="font-bold">'],
          post_tags: ['</span>'],
          fields: {
            '*': {
              highlight_query: searchQuery,
            },
          },
        },
        from,
        rest_total_hits_as_int: true,
        // sort: [{ 'metadata.createdAt': { order: 'desc' } }],
      })

      /* eslint-disable no-underscore-dangle */
      const results: ElasticResult[] = hits.hits.map((hit) => ({
        id: hit._id,
        filename: hit._source!.filename,
        highlight: hit.highlight,
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
