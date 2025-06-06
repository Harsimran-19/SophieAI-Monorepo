export interface UserDocument {
  id: string
  user_id: string
  filename: string
  file_path: string
  file_type: string
  document_type: "resume" | "cover_letter" | "other"
  created_at: Date
  updated_at: Date | null
  is_active: boolean
  display_name?: string | null
}

export interface UserProfile {
  id: string
  email: string
  resume_id: string | null // Kept for backward compatibility
  primary_resume_id: string | null
  created_at: Date
  name: string | null
  industry: string | null
  updated_at: Date | null
  job_titles: string[] | null // Use a more specific type if you know the JSON structure
  plan: "free" | "pro" | "enterprise" // Adjust based on your actual plans
  resume_analysis_id: string | null
}

export type UserProfileResponse =
  | { success: true; data: UserProfile }
  | { success: false; error: string }
