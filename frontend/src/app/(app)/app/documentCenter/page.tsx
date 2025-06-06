"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchAllResumesByCurrentAuth } from "@/actions/resumes/fetchAllResumesByCurrentAuth"
import { Plus, Search, Upload } from "lucide-react"

import type { Resume } from "@/types/resume"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentList } from "@/components/documentCenter/documentList"
import { UploadResumeModal } from "@/components/documentCenter/uploadResume"

export default function DocumentCenter() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await fetchAllResumesByCurrentAuth()
      setResumes(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-red-600">
          Error loading resumes. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Resume Center
              </h1>
              <p className="mt-1 text-gray-600">
                Manage your resumes and tailored applications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/app/resumeTailor")}
              >
                <Plus className="size-4" />
                Tailor Resume
              </Button>
              <Button
                className="gap-2 bg-teal-600 hover:bg-teal-700"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="size-4" />
                Create Resume
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2  text-gray-400" />
              <Input
                placeholder="Search resumes, jobs, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <DocumentList
            resumes={resumes}
            isLoading={loading}
            onRefresh={refresh}
          />
        </div>
      </div>

      <UploadResumeModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={refresh}
      />
    </div>
  )
}
