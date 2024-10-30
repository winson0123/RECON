import { faker } from "@faker-js/faker"

import { SearchResults, columns } from "./columns"
import { DataTable } from "./data-table"

// Function to generate random search results
const generateRandomSearchResults = (): SearchResults => {
  return {
    id: faker.string.uuid(),
    time: faker.date.recent().toISOString(), // Generates a recent date as an ISO string
    string: faker.lorem.paragraphs(), // Generates a random sentence
    screenshot: faker.image.url(), // Generates a random image URL
    host: faker.hacker.adjective(), // Generates a random hostname
    window: faker.system.commonFileName(), // Generates a random Window name
    source: faker.system.directoryPath(), // Generates a random source filepath
    sourcetype:
      faker.number.int() % 2 === 0 ? "Text matches" : "Visual matches", // Generates a source type, text/visual
  }
}

async function getData(): Promise<SearchResults[]> {
  // Fetch data from your API here.
  return faker.helpers.multiple(generateRandomSearchResults, { count: 15 })
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
