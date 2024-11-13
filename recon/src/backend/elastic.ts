import { Client } from '@elastic/elasticsearch'

const indices = ['submission'] as const

class ElasticController {
  readonly clients: Record<string, Client> = {}

  private async createElasticClient(elasticHost: string) {
    const client = new Client({
      node: elasticHost,
    })
    this.clients[elasticHost] = client
    await Promise.all(
      indices.map((index) => ElasticController.createIndex(client, index)),
    )
    return client
  }

  private static async createIndex(client: Client, index: string) {
    if (!(await client.indices.exists({ index })))
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

  async getElasticClient(elasticHost: string) {
    if (this.clients[elasticHost]) return this.clients[elasticHost]
    return this.createElasticClient(elasticHost)
  }
}

const elasticController = new ElasticController()

export default elasticController

