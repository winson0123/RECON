import { TableCell, TableRow } from "@/components/ui/table"

export default function RowContent({
  rowId,
  rowData,
}: {
  rowId: string
  rowData: any
}) {
  return rowData ? (
    <TableRow>
      <TableCell />
      <TableCell>Uploaded By: {rowData.subRows.uploadedBy}</TableCell>
      <TableCell>Username: {rowData.subRows.username}</TableCell>
      <TableCell>GUID: {rowData.subRows.guid}</TableCell>
    </TableRow>
  ) : null
}
