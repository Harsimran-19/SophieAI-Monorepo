"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { mockJobDescriptions } from "@/lib/data/mockTailoringHistory"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { JobDescriptionInput } from "./JobDescriptionInput"
import { ResumeSelect } from "./ResumeSelect"

// Helper function to get mock data based on URL
const getMockDataFromUrl = (url: string) => {
  const urlLower = url.toLowerCase()
  if (urlLower.includes("google")) return mockJobDescriptions.google
  if (urlLower.includes("meta") || urlLower.includes("facebook"))
    return mockJobDescriptions.meta
  if (urlLower.includes("amazon")) return mockJobDescriptions.amazon
  if (urlLower.includes("netflix")) return mockJobDescriptions.netflix
  return null
}

interface TailorNewRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function TailorNewRequestModal({
  open,
  onOpenChange,
  onSubmit,
}: TailorNewRequestModalProps) {
  const [jobInputMethod, setJobInputMethod] = useState<"url" | "paste">("url")
  const [jobUrl, setJobUrl] = useState("")
  const [role, setRole] = useState("")
  const [company, setCompany] = useState("")
  const [selectedResume, setSelectedResume] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [parsedJobDescription, setParsedJobDescription] = useState("")
  const [parsedCompanyDescription, setParsedCompanyDescription] = useState("")
  const [parsingError, setParsingError] = useState<boolean | "third-party">(
    false
  )
  const [parsing, setParsing] = useState(false)
  const [generateResume, setGenerateResume] = useState(true)
  const [generateCoverLetter, setGenerateCoverLetter] = useState(false)

  const resetForm = () => {
    setJobInputMethod("url")
    setJobUrl("")
    setParsedJobDescription("")
    setParsedCompanyDescription("")
    setRole("")
    setCompany("")
    setSelectedResume("")
    setParsing(false)
    setParsingError(false)
    setIsGenerating(false)
    setGenerateResume(true)
    setGenerateCoverLetter(false)
  }

  const handleCloseModal = () => {
    onOpenChange(false)
    resetForm()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseModal()
    }
    onOpenChange(open)
  }

  const fetchAndParseJobUrl = async () => {
    setParsing(true)
    setParsingError(false)

    try {
      // Check for third-party job boards
      const urlLower = jobUrl.toLowerCase()
      if (
        urlLower.includes("linkedin.com") ||
        urlLower.includes("indeed.com") ||
        urlLower.includes("glassdoor.com")
      ) {
        throw new Error("third-party")
      }

      // Simulated parsing delay
      await new Promise((res) => setTimeout(res, 1000))

      const mockData = getMockDataFromUrl(jobUrl)
      if (mockData) {
        setParsedJobDescription(mockData.jobDescription)
        setParsedCompanyDescription(mockData.companyDescription)
        setRole(mockData.role)
        setCompany(mockData.company)
      } else {
        throw new Error("unparsable")
      }
    } catch (err) {
      setParsedJobDescription("")
      setParsedCompanyDescription("")
      setRole("")
      setCompany("")

      // Show specific error message for third-party sites
      if (err.message === "third-party") {
        setParsingError("third-party")
      } else {
        setParsingError(true)
      }
    } finally {
      setParsing(false)
    }
  }

  const handleStartTailoring = async () => {
    if (!generateResume && !generateCoverLetter) {
      toast.error("Please select at least one document to generate")
      return
    }

    console.log("🚀 Starting tailoring process...")
    console.log("📝 Form Data:", {
      resumeId: selectedResume,
      jobTitle: role,
      jobDescription: parsedJobDescription.substring(0, 100) + "...",
      jobUrl,
      companyName: company,
      shouldTailorResume: generateResume,
      generateCoverLetter,
    })

    setIsGenerating(true)
    try {
      console.log("📤 Calling create-tailor API...")

      // Create FormData object
      const formData = new FormData()
      formData.append("resumeId", selectedResume)
      formData.append("jobTitle", role)
      formData.append("jobDescription", parsedJobDescription)
      formData.append("jobUrl", jobUrl || "")
      formData.append("companyName", company)
      formData.append("shouldTailorResume", String(generateResume))
      formData.append("generateCoverLetter", String(generateCoverLetter))

      const response = await fetch("/api/create-tailor", {
        method: "POST",
        body: formData,
      })

      console.log("📥 Received response status:", response.status)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const result = await response.json()
      console.log("📥 Parsed response data:", result)

      if (!result.success) {
        throw new Error(result.error || "Failed to create application")
      }

      toast.success(result.data.message)
      console.log("✅ Success! Calling onSubmit and closing modal...")
      onSubmit()
      handleCloseModal()
    } catch (error) {
      console.error("❌ Error in handleStartTailoring:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to create application"
      )
    } finally {
      console.log("🏁 Finishing up, setting isGenerating to false")
      setIsGenerating(false)
    }
  }

  const isGenerateDisabled =
    isGenerating ||
    !selectedResume ||
    !parsedJobDescription.trim() ||
    !role.trim() ||
    !company.trim() ||
    (!generateResume && !generateCoverLetter)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tailored Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ResumeSelect
            selectedResume={selectedResume}
            onResumeChange={setSelectedResume}
          />

          <JobDescriptionInput
            jobInputMethod={jobInputMethod}
            onJobInputMethodChange={setJobInputMethod}
            jobUrl={jobUrl}
            onJobUrlChange={setJobUrl}
            role={role}
            onRoleChange={setRole}
            company={company}
            onCompanyChange={setCompany}
            parsedJobDescription={parsedJobDescription}
            onParsedJobDescriptionChange={setParsedJobDescription}
            parsing={parsing}
            parsingError={parsingError}
            onFetchAndParse={fetchAndParseJobUrl}
          />

          {jobInputMethod === "url" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                <strong>Note:</strong> Only official company career pages can be
                parsed automatically (e.g., careers.google.com, jobs.meta.com).
                Third-party job boards like LinkedIn, Indeed, or Glassdoor are
                not supported for automatic parsing.
              </p>
            </div>
          )}

          {/* Document Selection */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">
              What would you like to generate?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resume"
                  checked={generateResume}
                  onCheckedChange={(checked) =>
                    setGenerateResume(checked as boolean)
                  }
                />
                <label
                  htmlFor="resume"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tailored Resume
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coverLetter"
                  checked={generateCoverLetter}
                  onCheckedChange={(checked) =>
                    setGenerateCoverLetter(checked as boolean)
                  }
                />
                <label
                  htmlFor="coverLetter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Cover Letter
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              onClick={handleStartTailoring}
              disabled={isGenerateDisabled}
              className="min-w-[150px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Start Tailoring
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
