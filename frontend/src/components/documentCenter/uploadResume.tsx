"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface UploadResumeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess?: () => void
}

export function UploadResumeModal({
  open,
  onOpenChange,
  onUploadSuccess,
}: UploadResumeModalProps) {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resumeName, setResumeName] = useState("")
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        setSelectedFile(file)
        setResumeName(file.name.replace(".pdf", ""))
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
      }
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        setSelectedFile(file)
        setResumeName(file.name.replace(".pdf", ""))
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !resumeName.trim()) return

    try {
      setUploading(true)
      console.log("[UploadResumeModal] Starting upload", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        title: resumeName.trim(),
      })

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", resumeName.trim())

      const res = await fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
      })

      let result
      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        console.error(
          "[UploadResumeModal] Non-JSON response:",
          await res.text()
        )
        throw new Error("Server returned non-JSON response")
      }

      result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Upload failed")
      }

      if (result.success) {
        console.log("[UploadResumeModal] Upload successful", {
          path: result.path,
          signedUrl: result.signedUrl,
        })
        toast({
          title: "Resume uploaded",
          description: "Your resume has been uploaded successfully",
        })
        onUploadSuccess?.()
        handleClose()
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("[UploadResumeModal] Upload error", { error: err })
      toast({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Failed to upload resume",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setResumeName("")
    onOpenChange(false)
  }

  const handleCreateFromBlank = () => {
    router.push("/app/resumeBuilder")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Resume</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create from Blank Option */}
          <Card
            className="cursor-pointer border-2 border-dashed border-blue-200 transition-colors hover:border-blue-300"
            onClick={handleCreateFromBlank}
          >
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                <Plus className="size-6 text-blue-600" />
              </div>
              <h3 className="mb-1 font-medium text-gray-900">
                Create from Blank
              </h3>
              <p className="text-sm text-gray-600">
                Start with a professional template
              </p>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                Or upload existing
              </span>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragActive
                ? "border-teal-400 bg-teal-50"
                : selectedFile
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-green-100">
                  <FileText className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="mr-1 size-4" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-gray-100">
                  <Upload className="size-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Drop your resume here
                  </p>
                  <p className="text-sm text-gray-600">
                    or click to browse files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
                <p className="text-xs text-gray-500">
                  PDF files only, max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Resume Name Input */}
          {selectedFile && (
            <div className="space-y-2">
              <Label htmlFor="resume-name">Resume Name</Label>
              <Input
                id="resume-name"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Enter resume name"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={!resumeName.trim() || uploading}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
