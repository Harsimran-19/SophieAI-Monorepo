"use server"

import { createClient } from "@/lib/supabase/server"

export interface UploadResumeResult {
  success: boolean
  error?: string
  resume?: any // Replace with concrete Resume type
}

export async function uploadResume(
  file: File,
  title: string
): Promise<UploadResumeResult> {
  const supabase = createClient()
  let resumeId: string | null = null
  let filePath: string | null = null

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Authentication failed")

    const userId = user.id
    if (!file || !title) throw new Error("Missing file or title")

    const { data: resume, error: dbError } = await supabase
      .from("resumes")
      .insert({
        title,
        status: "Active",
        user_id: userId,
        content: {}, // Optional: add default content structure
      })
      .select()
      .single()

    if (dbError || !resume) throw new Error("Failed to create resume record")
    resumeId = resume.id

    const fileExt = file.name.split(".").pop()
    filePath = `${userId}/${resumeId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, file, { cacheControl: "3600", upsert: false })

    if (uploadError) {
      await supabase.from("resumes").delete().eq("id", resumeId)
      throw new Error("File upload failed")
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from("resumes").createSignedUrl(filePath, 60 * 60)

    if (!signedUrlData?.signedUrl || signedUrlError) {
      await Promise.all([
        supabase.storage.from("resumes").remove([filePath]),
        supabase.from("resumes").delete().eq("id", resumeId),
      ])
      throw new Error("Failed to generate signed URL")
    }

    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        file_url: signedUrlData.signedUrl,
        file_path: filePath,
      })
      .eq("id", resumeId)

    if (updateError) {
      await Promise.all([
        supabase.storage.from("resumes").remove([filePath]),
        supabase.from("resumes").delete().eq("id", resumeId),
      ])
      throw new Error("Failed to update resume record")
    }

    return { success: true, resume }
  } catch (err) {
    if (filePath || resumeId) {
      await Promise.all([
        filePath && supabase.storage.from("resumes").remove([filePath]),
        resumeId && supabase.from("resumes").delete().eq("id", resumeId),
      ])
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected error",
    }
  }
}
