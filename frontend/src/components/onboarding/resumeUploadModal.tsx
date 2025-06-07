"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { File, Upload, X } from "lucide-react"

interface ResumeUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, displayName: string) => void
}

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onUpload
}: ResumeUploadModalProps) {
  const [displayName, setDisplayName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Set default display name to filename without extension
      setDisplayName(file.name.split('.')[0])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      onUpload(selectedFile, displayName)
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setDisplayName("")
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Resume (Optional)</DialogTitle>
          <DialogDescription>
            Upload your resume to get personalized job recommendations and AI-powered resume analysis
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Resume File</Label>
              <div className="mt-1 relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <div className={`flex items-center justify-center h-10 px-4 py-2 rounded-md border ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300'} text-sm`}>
                  <File className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : "Choose file"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only PDF, DOC, or DOCX files up to 10 MB
              </p>
            </div>

            {selectedFile && (
              <div>
                <Label htmlFor="display-name">Resume Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter a name for your resume"
                  className="mt-1"
                  disabled={isUploading}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUploading}>
                Skip
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
