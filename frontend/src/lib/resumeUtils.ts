// app/lib/resumeUtils.ts
"use server"

import api from "@/services/apiService"
import type { UserProfile } from "@/types/user-profile"
import { createClient as createServerClient } from "@/lib/supabase/server"

/**
 * Get file path for a resume - handles both legacy and new document system
 */
export async function getResumeFilePath(profile: UserProfile) {
  try {
    const supabase = createServerClient()
    
    // If we have a primary_resume_id, get the file path from user_documents
    if (profile.primary_resume_id) {
      const { data: document, error } = await supabase
        .from('user_documents')
        .select('file_path')
        .eq('id', profile.primary_resume_id)
        .single()
        
      if (error || !document) {
        // Fall back to legacy resume_id if available
        if (profile.resume_id) {
          return { success: true, data: profile.resume_id }
        }
        
        throw new Error('Primary resume not found')
      }
      
      return { success: true, data: document.file_path }
    }
    
    // Fall back to legacy resume_id
    if (profile.resume_id) {
      return { success: true, data: profile.resume_id }
    }
    
    return { success: false, error: 'No resume available' }
  } catch (error) {
    console.error("Error getting resume file path:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get resume path",
    }
  }
}

/**
 * Download a resume file by path
 */
export async function downloadResume(resumePath: string | null) {
  if (!resumePath) {
    return {
      success: false,
      error: "No Resume",
    }
  }
  try {
    const supabase = createServerClient()

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resumePath)

    if (downloadError) {
      throw downloadError
    }

    return { success: true, data: fileData }
  } catch (error) {
    console.error("Error downloading resume:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to download resume",
    }
  }
}

/**
 * Download a user's primary resume
 */
export async function downloadPrimaryResume(profile: UserProfile) {
  try {
    // Get the file path
    const { success, data: filePath, error } = await getResumeFilePath(profile)
    if (!success || !filePath) {
      throw new Error(error || 'No resume available')
    }
    
    // Download the file
    return downloadResume(filePath)
  } catch (error) {
    console.error("Error downloading primary resume:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to download primary resume",
    }
  }
}

export const fetchResumeContent = async (resume: string | null) => {
  if (!resume) {
    return "empty resume"
  }
  try {
    // Replace this with your actual resume fetching logic
    const {
      success: downloadSuccess,
      data: fileData,
      error: downloadError,
    } = await downloadResume(resume)
    if (!downloadSuccess || !fileData) {
      throw new Error(downloadError || "Failed to download resume")
    }
    console.log(fileData)
    const formData = new FormData()
    formData.append("file", fileData, "resume.pdf")
    const { data: extractResponse } = await api.post<{
      extracted_text: string
    }>("/extract-pdf-text", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return extractResponse.extracted_text
  } catch (error) {
    console.error("Error fetching resume:", error)
    throw error
  }
}

export async function extractPdfText(file: File) {
  try {
    // Create form data for API request
    const formData = new FormData()
    formData.append("file", file)

    // Call the FastAPI endpoint
    const { data: extractResponse } = await api.post<{
      extracted_text: string
    }>("/extract-pdf-text", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return {
      success: true,
      data: extractResponse.extracted_text,
    }
  } catch (error) {
    console.error("Error extracting PDF text:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
