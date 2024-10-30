import { SearchResults, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<SearchResults[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      time: "1:00 AM",
      string: "pending",
      screenshot: "abc.png",
      subRows: {
        uploadedBy: "User2",
        username: "user2",
        guid: "guid-2",
      },
    },
    // ...
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
