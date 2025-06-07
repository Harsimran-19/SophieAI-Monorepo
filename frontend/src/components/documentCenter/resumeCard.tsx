"use client"

import { useState } from "react"
import { deleteResume } from "@/actions/resumes/deleteResume"
import { Eye, FileText, MoreVertical, Trash2 } from "lucide-react"
import { toast } from "sonner"

import type { Resume } from "@/types/resume"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ResumeCardProps {
  resume: Resume
  onDelete?: () => void
  onDownload?: () => void
}

export function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    console.log("[ResumeCard] Starting delete operation", {
      resumeId: resume.id,
      title: resume.title,
    })

    try {
      setIsDeleting(true)
      console.log("[ResumeCard] Delete state set to true")

      const { success, error } = await deleteResume(resume.id)
      console.log("[ResumeCard] Delete operation response", {
        success,
        error,
        resumeId: resume.id,
      })

      if (success) {
        console.log("[ResumeCard] Delete successful, calling onDelete callback")
        toast.success("Resume deleted successfully")
        onDelete?.()
      } else {
        console.error("[ResumeCard] Delete operation failed", {
          error,
          resumeId: resume.id,
        })
        throw error || new Error("Failed to delete resume")
      }
    } catch (error) {
      console.error("[ResumeCard] Exception during delete operation", {
        error,
        resumeId: resume.id,
      })
      toast.error(
        error instanceof Error ? error.message : "Failed to delete resume"
      )
    } finally {
      console.log("[ResumeCard] Cleanup after delete operation", {
        resumeId: resume.id,
      })
      setIsDeleting(false)
      setOpen(false)
    }
  }

  const handlePreview = () => {
    console.log("[ResumeCard] Opening preview", {
      resumeId: resume.id,
      fileUrl: resume.file_url,
    })
    window.open(resume.file_url, "_blank")
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="size-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{resume.title}</h3>
              {resume.updated_at && (
                <p className="mt-1 text-sm text-gray-500">
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                title="Preview Resume"
                onClick={handlePreview}
                aria-label="Preview Resume"
              >
                <Eye className="size-4" />
              </Button>

              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Delete Resume"
                    className="text-red-500 hover:text-red-600"
                    disabled={isDeleting}
                    aria-label="Delete Resume"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. It will permanently delete
                      this resume and its associated file from storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    aria-label="More options"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
