import { createClient } from "@/lib/supabase/client"

export interface UploadResumeParams {
  file: File
  title: string
  userId: string
}

export interface UploadResumeResult {
  success: boolean
  error?: Error
  resume?: any // Replace with your Resume type when available
}

/**
 * Uploads a resume file to Supabase storage and creates a database record
 * Handles both storage upload and database operations in a transaction-like manner
 *
 * If any step fails, it will clean up any created resources
 *
 * @param params - Object containing file, title, and userId
 * @returns Promise<UploadResumeResult>
 */
export async function uploadResume({
  file,
  title,
  userId,
}: UploadResumeParams): Promise<UploadResumeResult> {
  const supabase = createClient()
  let resumeId: string | null = null
  let filePath: string | null = null

  try {
    // Validate inputs
    if (!file || !title || !userId) {
      throw new Error("Missing required parameters")
    }

    // Step 1: Create resume record to get ID
    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        title,
        status: "Active",
        user_id: userId,
        content: {},
      })
      .select()
      .single()
      .throwOnError()

    if (dbError) throw new Error("Failed to create resume record")
    if (!resume) throw new Error("No resume record created")

    resumeId = resume.id

    // Step 2: Upload file to storage
    const fileExt = file.name.split(".").pop()
    filePath = `${userId}/${resumeId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      // Clean up the resume record if upload fails
      await supabase.from("resumes").delete().eq("id", resumeId)
      throw new Error("Failed to upload file")
    }

    // Step 3: Generate signed URL
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from("resumes").createSignedUrl(filePath, 60 * 60) // 1 hour expiration

    if (signedUrlError || !signedUrlData?.signedUrl) {
      // Clean up both storage and record if URL generation fails
      await Promise.all([
        supabase.storage.from("resumes").remove([filePath]),
        supabase.from("resumes").delete().eq("id", resumeId),
      ])
      throw new Error("Failed to generate signed URL")
    }

    // Step 4: Update resume record with file info
    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        file_url: signedUrlData.signedUrl,
        file_path: filePath,
      })
      .eq("id", resumeId)
      .throwOnError()

    if (updateError) {
      // Clean up everything if update fails
      await Promise.all([
        supabase.storage.from("resumes").remove([filePath]),
        supabase.from("resumes").delete().eq("id", resumeId),
      ])
      throw new Error("Failed to update resume with file information")
    }

    return { success: true, resume }
  } catch (err) {
    // If we have partial resources created but hit an error,
    // try to clean them up one last time
    if (resumeId || filePath) {
      await Promise.all(
        [
          filePath && supabase.storage.from("resumes").remove([filePath]),
          resumeId && supabase.from("resumes").delete().eq("id", resumeId),
        ].filter(Boolean)
      )
    }

    const error =
      err instanceof Error ? err : new Error("Failed to upload resume")
    return { success: false, error }
  }
}
