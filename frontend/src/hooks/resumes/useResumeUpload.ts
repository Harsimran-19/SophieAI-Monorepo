"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthProvider"

import {
  uploadResume,
  type UploadResumeParams,
  type UploadResumeResult,
} from "@/lib/resumes/upload"

export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { user } = useAuth()

  const handleUpload = async (
    params: Omit<UploadResumeParams, "userId">
  ): Promise<UploadResumeResult> => {
    if (!user) {
      const err = new Error("User not authenticated")
      setError(err)
      return { success: false, error: err }
    }

    setUploading(true)
    setError(null)

    const result = await uploadResume({
      ...params,
      userId: user.id,
    })

    if (!result.success) {
      setError(result.error ?? new Error("Unknown upload error"))
    }

    setUploading(false)
    return result
  }

  return {
    uploadResume: handleUpload,
    uploading,
    error,
  }
}
