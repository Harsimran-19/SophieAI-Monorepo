"use client"

import { useState, useRef } from "react"
import { uploadDocument } from "@/actions/documents"
import { UserDocument } from "@/types/user-profile"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { File, Upload, X } from "lucide-react"

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (document: UserDocument) => void
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess
}: DocumentUploadModalProps) {
  const [documentType, setDocumentType] = useState<'resume' | 'cover_letter' | 'other'>('resume')
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocument(
        selectedFile,
        documentType,
        displayName || undefined
      )

      if (result.success && result.data) {
        onSuccess(result.data)
        resetForm()
        onClose()
      } else {
        setError(result.error || "Failed to upload document")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setDocumentType('resume')
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
          <DialogTitle>Select your document type and then upload</DialogTitle>
          <DialogDescription>
            Upload your resume, cover letter, or any other job application materials
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Select your document type</h4>
              <RadioGroup
                defaultValue="resume"
                value={documentType}
                onValueChange={(value) => setDocumentType(value as any)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resume" id="resume" />
                  <Label htmlFor="resume">Resume</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cover_letter" id="cover_letter" />
                  <Label htmlFor="cover_letter">Cover Letter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="file-upload">File</Label>
              <div className="mt-1 relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
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
                <Label htmlFor="display-name">Document Name (Optional)</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter a name for your document"
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
                Cancel
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
