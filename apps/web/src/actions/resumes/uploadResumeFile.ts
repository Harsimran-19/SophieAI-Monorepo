"use server"

import { v4 as uuidv4 } from "uuid"

import { DEFAULT_RESUME_CONTENT } from "@/lib/constants/resume"
import { ResumeError } from "@/lib/errors/resumeError"
import { createClient } from "@/lib/supabase/server"

interface UploadResumeFileResult {
  id: string
  title: string
  path: string
  signedUrl: string
}

/**
 * Uploads a PDF resume file to Supabase Storage and creates a record in the resumes table
 */
export async function uploadResumeFile(
  formData: FormData
): Promise<UploadResumeFileResult> {
  try {
    const file = formData.get("file")
    const title = formData.get("title") as string
    const resumeId = uuidv4()

    if (!file || !title) {
      throw new ResumeError("Missing required fields")
    }

    // Ensure file is a File or Blob object
    if (!(file instanceof Blob)) {
      throw new ResumeError("Invalid file format")
    }

    // Verify file type
    const mimeType = file.type || "application/octet-stream"
    if (mimeType !== "application/pdf") {
      throw new ResumeError("Only PDF files are allowed")
    }

    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new ResumeError("Authentication failed")
    }

    // Construct the file path
    const path = `${user.id}/${resumeId}.pdf`

    // Convert File/Blob to ArrayBuffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer()

    // Upload the file to storage
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(path, arrayBuffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      throw new ResumeError("Failed to upload file", uploadError)
    }

    // Generate a signed URL with 1-hour expiration for the file_url
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from("resumes").createSignedUrl(path, 60 * 60) // 1 hour expiration

    if (signedUrlError || !signedUrlData?.signedUrl) {
      // Clean up the uploaded file if URL generation fails
      await supabase.storage.from("resumes").remove([path])
      throw new ResumeError("Failed to generate signed URL", signedUrlError)
    }

    // Create a record in the resumes table with the signed URL
    const { data: resumeData, error: dbError } = await supabase
      .from("resumes")
      .insert([
        {
          id: resumeId,
          user_id: user.id,
          title: title,
          file_path: path,
          file_url: signedUrlData.signedUrl,
          content: DEFAULT_RESUME_CONTENT,
          status: "Draft",
        },
      ])
      .select()
      .single()

    if (dbError || !resumeData) {
      // If database insert fails, try to clean up the uploaded file
      await supabase.storage.from("resumes").remove([path])
      throw new ResumeError("Failed to create resume record", dbError)
    }

    // Generate a short-lived signed URL for immediate download/preview
    const { data: previewUrlData, error: previewUrlError } =
      await supabase.storage.from("resumes").createSignedUrl(path, 60) // 60 seconds expiry for preview

    if (previewUrlError || !previewUrlData?.signedUrl) {
      throw new ResumeError("Failed to generate preview URL", previewUrlError)
    }

    return {
      id: resumeData.id,
      title: resumeData.title,
      path: resumeData.file_path,
      signedUrl: previewUrlData.signedUrl,
    }
  } catch (error) {
    console.error("Error in uploadResumeFile:", error)
    throw error instanceof ResumeError
      ? error
      : new ResumeError("Failed to upload resume file", error as Error)
  }
}
