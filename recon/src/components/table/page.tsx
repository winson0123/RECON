import { faker } from "@faker-js/faker"

import { SearchResults, columns } from "./columns"
import { DataTable } from "./data-table"

// Function to generate random search results
const generateRandomSearchResults = (): SearchResults => {
  return {
    id: faker.string.uuid(),
    time: faker.date.recent().toISOString(), // Generates a recent date as an ISO string
    string: faker.lorem.sentence(), // Generates a random sentence
    screenshot: faker.image.url(), // Generates a random image URL
    subRows: {
      uploadedBy: faker.person.firstName(), // Random name for the uploader
      username: faker.internet.username(), // Random username
      guid: faker.string.uuid(), // Random GUID
    },
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
