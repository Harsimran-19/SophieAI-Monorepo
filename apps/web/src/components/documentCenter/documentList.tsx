"use client"

import { useEffect, useState } from "react"
import { FileText, Upload } from "lucide-react"

import type { Resume } from "@/types/resume"

import { Button } from "@/components/ui/button"

import { ResumeCard } from "./resumeCard"
import { UploadResumeModal } from "./uploadResume"

interface DocumentListProps {
  resumes: Resume[]
  isLoading: boolean
  onRefresh?: () => void
}

export function DocumentList({
  resumes,
  isLoading,
  onRefresh,
}: DocumentListProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [localResumes, setLocalResumes] = useState<Resume[]>(resumes)

  useEffect(() => {
    setLocalResumes(resumes)
  }, [resumes])

  const handleDeleteResume = (id: string) => {
    setLocalResumes((prev) => prev.filter((r) => r.id !== id))
    onRefresh?.()
  }

  if (isLoading) {
    return (
      <div className="flex size-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
          <p className="text-gray-600">Loading resumes...</p>
        </div>
      </div>
    )
  }

  if (localResumes.length === 0) {
    return (
      <>
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="size-6 text-gray-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No resumes yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first resume
          </p>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="mt-6 gap-2"
            size="lg"
          >
            <Upload className="size-4" />
            Upload Resume
          </Button>
        </div>

        <UploadResumeModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onUploadSuccess={onRefresh}
        />
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Base Resumes Section */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Base Resumes
            </h2>
            <span className="text-sm text-gray-500">
              ({localResumes.length})
            </span>
          </div>
          <div className="grid gap-4">
            {localResumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={() => handleDeleteResume(resume.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <UploadResumeModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={onRefresh}
      />
    </>
  )
}
