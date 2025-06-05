import { createClient } from "@/lib/supabase/client"

interface DownloadResumeResult {
  success: boolean
  error?: Error
  data?: Blob
}

/**
 * Downloads a resume file from Supabase storage
 *
 * @param filePath - The storage path of the resume file
 * @returns Promise<DownloadResumeResult>
 */
export async function downloadResume(
  filePath: string
): Promise<DownloadResumeResult> {
  const supabase = createClient()

  try {
    // Validate input
    if (!filePath) {
      throw new Error("File path is required")
    }

    // Download the file
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(filePath)

    if (error) {
      throw new Error("Failed to download file from storage")
    }

    if (!data) {
      throw new Error("No file data received")
    }

    return {
      success: true,
      data,
    }
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error("Failed to download resume")
    return { success: false, error }
  }
}
