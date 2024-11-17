import { Client } from '@elastic/elasticsearch'

const indices = ['submission'] as const

function createIndex(client: Client, index: string) {
  if (!(client.indices.exists({ index })))
    client.indices.create({
      index,
      mappings: {
        dynamic_templates: [
          {
            whitespace_lowercase: {
              match_mapping_type: 'string',
              mapping: { type: 'text' },
            },
          },
          {
            longs: {
              match_mapping_type: 'long',
              mapping: { type: 'float' },
            },
          },
        ],
      },
      settings: {
        analysis: {
          analyzer: {
            default: {
              type: 'custom',
              tokenizer: 'whitespace',
              filter: ['lowercase'],
            },
          },
        },
        mapping: {
          total_fields: { limit: 10000 },
        },
      },
    })
}

if (!process.env.ELASTIC_BASEURL) throw new Error("Invalid ELASTIC_BASEURL environment variable")
const elasticClient = new Client({
  node:process.env.ELASTIC_BASEURL
})

indices.map((index) => createIndex(elasticClient, index))

export default elasticClient

