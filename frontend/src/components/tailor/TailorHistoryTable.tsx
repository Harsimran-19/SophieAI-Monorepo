import type { Application } from "@/types/application"

import { Card, CardContent } from "@/components/ui/card"

import { TailorHistoryRow } from "./TailorHistoryRow"

interface TailorHistoryTableProps {
  tailoringHistory: Application[]
}

export function TailorHistoryTable({
  tailoringHistory,
}: TailorHistoryTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Job Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Base Resume
                </th> */}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tailoringHistory.length > 0 ? (
                tailoringHistory.map((record) => (
                  <TailorHistoryRow key={record.id} record={record} />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No tailoring history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
