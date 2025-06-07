import { useState } from "react"
import { FileText } from "lucide-react"

import type { Application } from "@/types/application"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TailorHistoryRowProps {
  record: Application
}

export function TailorHistoryRow({ record }: TailorHistoryRowProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusBadge = (status: Application["status"]) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="border-0 bg-green-100 text-green-700">
            Completed
          </Badge>
        )
      case "In Progress":
        return (
          <Badge className="border-0 bg-blue-100 text-blue-700">
            In Progress
          </Badge>
        )
      case "Failed":
        return (
          <Badge className="border-0 bg-red-100 text-red-700">Failed</Badge>
        )
      default:
        return (
          <Badge className="border-0 bg-gray-100 text-gray-700">{status}</Badge>
        )
    }
  }

  // const getMatchScoreColor = (score: number | null) => {
  //   if (score === null) return "text-gray-600 bg-gray-100"
  //   if (score >= 80) return "text-green-600 bg-green-100"
  //   if (score >= 60) return "text-yellow-600 bg-yellow-100"
  //   return "text-red-600 bg-red-100"
  // }

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => setShowDetails(true)}
      >
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          {record.job.job_title}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {record.company.name}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {new Date(record.applied_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </td>
        {/* <td className="px-4 py-3 text-sm text-gray-600">
          {record.resume.resume_name}
        </td> */}
        <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {record.status === "Completed" && record.tailored_resume_id && (
              <Button
                key={record.tailored_resume_id}
                variant="ghost"
                size="sm"
                className="size-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(record.tailored_resume_id, "_blank")
                }}
              >
                <FileText className="size-4 text-gray-600" />
              </Button>
            )}
          </div>
        </td>
      </tr>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {record.job.job_title}
                </h3>
                <p className="mt-1 text-gray-600">{record.company.name}</p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h4 className="mb-2 font-medium text-gray-900">
                Job Description
              </h4>
              <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                {record.job.job_description}
              </div>
            </div>

            {/* Company Description */}
            {record.company.name && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  About {record.company.name}
                </h4>
                <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                  {record.company.name}
                </div>
              </div>
            )}

            {/* Generated Files */}
            {record.status === "Completed" && record.tailored_resume_id && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Generated Documents
                </h4>
                <div className="space-y-2">
                  <Button
                    key={record.tailored_resume_id}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      window.open(record.tailored_resume_id, "_blank")
                    }
                  >
                    <FileText className="size-4" />
                    {record.tailored_resume_id}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
