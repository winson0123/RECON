import { Client } from '@elastic/elasticsearch'

if (!process.env.ELASTIC_BASEURL) throw new Error("Invalid ELASTIC_BASEURL environment variable")
const elasticClient = new Client({
  node:process.env.ELASTIC_BASEURL
})

export default elasticClient
