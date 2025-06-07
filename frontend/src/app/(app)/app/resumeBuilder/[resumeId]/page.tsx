"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { updateResume } from "@/actions/resumes/updateResume"
import { Download, MoreVertical, Star } from "lucide-react"

import { useResume } from "@/hooks/resumes/useResume"
import { generateDocxBlob } from "@/lib/resumes/generateDocx"
import { generateResumePdfBlob } from "@/lib/resumes/generatePDF"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { AiChatPanel } from "@/components/resumeBuilder/ai-chat-panel"
import { DocumentEditor } from "@/components/resumeBuilder/document-editor"
import { FloatingPanelControls } from "@/components/resumeBuilder/floating-panel-controls"
import { LoadingSpinner } from "@/components/resumeBuilder/loading-spinner"
import { ResizablePanel } from "@/components/resumeBuilder/resizable-panel"
import { ResumeFormPanel } from "@/components/resumeBuilder/resume-form-panel"

export default function ResumeBuilder() {
  const params = useParams()
  const resumeId = params.resumeId as string
  const { toast } = useToast()

  const {
    draftData,
    liveData,
    resumeStatus,
    loading,
    error,
    setDraftData,
    saveDraft,
    refresh,
  } = useResume(resumeId)

  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [leftPanelWidth, setLeftPanelWidth] = useState(400)
  const [rightPanelWidth, setRightPanelWidth] = useState(400)
  const [isSettingActive, setIsSettingActive] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isActive = resumeStatus === "Active"

  const handleSetActive = async () => {
    try {
      setIsSettingActive(true)
      const { error } = await updateResume({
        id: resumeId,
        status: "Active",
      })

      if (error) throw error

      await refresh()
      toast({
        title: "Success",
        description: "This resume is now active.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set resume as active.",
        variant: "destructive",
      })
    } finally {
      setIsSettingActive(false)
    }
  }

  const handleDownload = async (fileType: "pdf" | "docx") => {
    try {
      setIsDownloading(true)

      // Make sure the resume content is available
      if (!draftData) {
        toast({
          title: "No content",
          description: "Resume content not loaded. Please try again.",
          variant: "destructive",
        })
        return
      }

      let file: File

      // Step 1: Generate the file
      if (fileType === "pdf") {
        // Make sure the element exists before trying to generate PDF
        const contentElement = document.getElementById("resume-content")
        if (!contentElement) {
          throw new Error("Resume content element not found. Please try again.")
        }

        // Generate PDF from the rendered content
        const blob = await generateResumePdfBlob("resume-content")
        file = new File([blob], `${resumeId}.pdf`, { type: "application/pdf" })
      } else if (fileType === "docx") {
        const blob = await generateDocxBlob(draftData)
        file = new File([blob], `${resumeId}.docx`, {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        })
      } else {
        throw new Error(`Unsupported file type: ${fileType}`)
      }

      // Step 2: Upload the file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("resumeId", resumeId)
      formData.append("fileType", fileType)

      const response = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const { signedUrl } = await response.json()

      // Step 3: Trigger download
      window.open(signedUrl, "_blank")

      toast({
        title: "Success",
        description: `Resume ${fileType.toUpperCase()} downloaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : `Failed to generate or download ${fileType.toUpperCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await saveDraft()
    } catch (error) {
      // Error toast is already handled in useResume hook
    } finally {
      setIsSaving(false)
    }
  }

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !draftData || !liveData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-gray-100">
        <p className="text-lg font-medium text-red-600">
          {error || "Failed to load resume"}
        </p>
        <button
          onClick={refresh}
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-100">
      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Document Editor Background Layer */}
        <div className="absolute inset-0 z-0 overflow-auto">
          <DocumentEditor data={liveData} />
        </div>

        {/* Foreground Floating Panels */}
        <div className="pointer-events-none relative z-10 flex size-full">
          {/* Left Panel */}
          {leftPanelOpen && (
            <ResizablePanel
              defaultWidth={leftPanelWidth}
              minWidth={320}
              maxWidth={600}
              position="left"
              onWidthChange={setLeftPanelWidth}
              className="pointer-events-auto"
            >
              <ResumeFormPanel
                data={draftData}
                onDataChange={setDraftData}
                onCollapse={() => setLeftPanelOpen(false)}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </ResizablePanel>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Panel */}
          {rightPanelOpen && (
            <ResizablePanel
              defaultWidth={rightPanelWidth}
              minWidth={320}
              maxWidth={600}
              position="right"
              onWidthChange={setRightPanelWidth}
              className="pointer-events-auto"
            >
              <AiChatPanel
                onSuggestion={(suggestion) => {
                  if (draftData) {
                    setDraftData({
                      ...draftData,
                      ...suggestion,
                    })
                  }
                }}
                onCollapse={() => setRightPanelOpen(false)}
              />
            </ResizablePanel>
          )}
        </div>

        {/* Bottom center action bar */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          {/* Desktop View (md and up) */}
          <div className="pointer-events-auto hidden gap-3 rounded-lg bg-white px-4 py-2 shadow-md lg:flex">
            <Button
              onClick={handleSetActive}
              disabled={isSettingActive || isActive}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Star
                className={`size-4 ${
                  isActive
                    ? "fill-yellow-400 text-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
              <span className={isActive ? "font-semibold text-yellow-600" : ""}>
                {isActive ? "Active" : "Set as Active"}
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading}>
                  <Download className="mr-2 size-4" />
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownload("pdf")}>
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("docx")}>
                  Download as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile View (sm and down) */}
          <div className="pointer-events-auto lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="size-10 rounded-full bg-white shadow-md"
                >
                  <MoreVertical className="size-5 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem
                  onClick={handleSetActive}
                  disabled={isSettingActive || isActive}
                  className="flex items-center gap-2"
                >
                  <Star
                    className={`size-4 ${
                      isActive
                        ? "fill-yellow-400 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={isActive ? "font-semibold text-yellow-600" : ""}
                  >
                    {isActive ? "Active" : "Set as Active"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                  onClick={() => handleDownload("pdf")}
                >
                  <Download className="size-4" />
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                  onClick={() => handleDownload("docx")}
                >
                  <Download className="size-4" />
                  Download as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Floating Panel Controls (always on top) */}
        <div className="pointer-events-none absolute inset-0 z-20">
          <FloatingPanelControls
            leftPanelOpen={leftPanelOpen}
            rightPanelOpen={rightPanelOpen}
            onLeftPanelToggle={() => setLeftPanelOpen(!leftPanelOpen)}
            onRightPanelToggle={() => setRightPanelOpen(!rightPanelOpen)}
          />
        </div>
      </div>
    </div>
  )
}
