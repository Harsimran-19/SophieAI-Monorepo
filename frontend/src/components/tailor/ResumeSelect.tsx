"use client"

import { useEffect, useState } from "react"
import { fetchAllResumesByCurrentAuth } from "@/actions/resumes/fetchAllResumesByCurrentAuth"
import { useAuth } from "@/context/AuthProvider"
import { Download, Eye } from "lucide-react"

import type { Resume } from "@/types/resume"

import { Button } from "@/components/ui/button"

interface ResumeSelectProps {
  selectedResume: string
  onResumeChange: (resumeId: string) => void
}

export function ResumeSelect({
  selectedResume,
  onResumeChange,
}: ResumeSelectProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const { user } = useAuth()

  useEffect(() => {
    fetchAllResumesByCurrentAuth().then(setResumes).catch(console.error)
  }, [user?.id])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Resume
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={selectedResume}
            onChange={(e) => onResumeChange(e.target.value)}
          >
            <option value="">Select resume...</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
            <svg
              className="size-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Download className="size-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Eye className="size-4" />
        </Button>
      </div>
    </div>
  )
}
