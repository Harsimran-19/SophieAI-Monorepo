"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createResume } from "@/actions/resumes/createResume"
import { fetchAllResumesByCurrentAuth } from "@/actions/resumes/fetchAllResumesByCurrentAuth"
import {
  ArrowRight,
  Clock,
  FileText,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  Zap,
} from "lucide-react"

import type { Resume } from "@/types/resume"

import { formatDistanceToNow } from "@/lib/utils/date"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { UploadResumeModal } from "@/components/documentCenter/uploadResume"
import { LoadingSpinner } from "@/components/resumeBuilder/loading-spinner"

export default function ResumeBuilderStart() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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

  const handleRefineResume = (resumeId: string) => {
    router.push(`/app/resumeBuilder/${resumeId}`)
  }

  const handleCreateFromBlank = async () => {
    setIsCreating(true)
    try {
      const { data: newResume, error } = await createResume()

      if (error || !newResume) {
        toast({
          title: "Creation failed",
          description: error || "Unable to create a new resume",
          variant: "destructive",
        })
        return
      }

      router.push(`/app/resumeBuilder/${newResume.id}`)
    } catch (err) {
      toast({
        title: "Unexpected error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const filteredResumes = resumes
    .filter((resume) =>
      resume.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by updated_at in descending order (most recent first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    .slice(0, 5) // Only show 5 most recent resumes

  // Show error if fetch fails
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
          <div className="mb-4 flex flex-col items-start justify-start">
            <h1 className="text-2xl font-semibold text-gray-900">
              AI Resume Builder
            </h1>
            <p className="mt-1 text-gray-600">
              Create a professional resume or refine an existing one with AI
              assistance
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Create from Blank */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100">
                    <Plus className="size-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Create from Blank
                    </h2>
                    <p className="text-gray-600">
                      Start with a standard resume format and build your resume
                      from scratch
                    </p>
                  </div>
                </div>

                {/* Simplified Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="size-8 text-blue-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Standard Resume
                      </h3>
                      <p className="mb-6 text-gray-600">
                        Professional format suitable for most industries
                      </p>

                      {/* Features */}
                      <div className="mb-6 rounded-lg bg-gray-50 p-4">
                        <h4 className="mb-3 font-medium text-gray-900">
                          What you&apos;ll get:
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-teal-600" />
                            AI-powered suggestions
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="size-4 text-teal-600" />
                            Real-time preview
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="size-4 text-teal-600" />
                            ATS-optimized format
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-teal-600" />
                            Professional design
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleCreateFromBlank}
                        disabled={isCreating}
                        className="w-full bg-teal-600 hover:bg-teal-700"
                        size="lg"
                      >
                        {isCreating ? (
                          <>
                            <LoadingSpinner />
                            <span className="ml-2">Creating...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 size-5" />
                            Start Building Resume
                            <ArrowRight className="ml-2 size-5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Refine Existing Resume */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-teal-100">
                    <TrendingUp className="size-6 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Refine Existing Resume
                    </h2>
                    <p className="text-gray-600">
                      Upload or select an existing resume to improve and
                      optimize
                    </p>
                  </div>
                </div>

                {/* Upload Option */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-teal-100">
                        <Upload className="size-8 text-teal-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Upload New Resume
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Upload a PDF or Word document to get started
                      </p>
                      <Button
                        onClick={() => setUploadModalOpen(true)}
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        <Upload className="mr-2 size-4" />
                        Choose File
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Resumes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="size-5 text-gray-600" />
                      Recent Resumes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search your resumes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Resume List */}
                    <div className="space-y-3">
                      {loading ? (
                        <div className="py-8 text-center">
                          <p className="text-gray-600">Loading resumes...</p>
                        </div>
                      ) : filteredResumes.length > 0 ? (
                        filteredResumes.map((resume) => (
                          <div
                            key={resume.id}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                            onClick={() => handleRefineResume(resume.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                                <FileText className="size-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {resume.title}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(resume.updated_at)
                                    )}
                                  </span>
                                  <Badge
                                    variant={
                                      resume.status === "Active"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="ml-2"
                                  >
                                    {resume.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="size-5 text-gray-400" />
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <FileText className="mx-auto mb-3 size-12 text-gray-400" />
                          <p className="text-gray-600">
                            {searchQuery
                              ? "No resumes found"
                              : "No recent resumes"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchQuery
                              ? "Try a different search term"
                              : "Upload a resume to get started"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadModalOpen(true)}
                          className="justify-start"
                        >
                          <Upload className="mr-2 size-4" />
                          Upload Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={() => router.push("/app/documentCenter")}
                        >
                          <Search className="mr-2 size-4" />
                          Browse All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <div className="rounded-2xl bg-teal-50 p-8">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Need Help Getting Started?
                </h3>
                <p className="mb-6 text-gray-600">
                  Our AI assistant can help you create a professional resume in
                  minutes
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" className="gap-2">
                    <Users className="size-4" />
                    View Examples
                  </Button>
                  <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Sparkles className="size-4" />
                    Get AI Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadResumeModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadSuccess={refresh}
      />
    </div>
  )
}
