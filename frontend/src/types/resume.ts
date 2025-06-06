import type { Application, ApplicationStatus } from "./application"
import type { ResumeData } from "./resume-content"

export type ResumeStatus = "Active" | "Archived" | "Draft"

export interface Resume {
  id: string
  title: string
  created_at: string
  updated_at: string
  status: ResumeStatus
  user_id: string
  content: ResumeData
  file_url?: string
  file_path?: string
}

// Base tailored resume without application details
export interface TailoredResume {
  id: string
  original_resume_id: string
  application_id: string
  file_url: string
  file_path: string
  created_at: string
  updated_at: string
}

// Combined type for display purposes
export interface TailoredResumeWithApplication extends TailoredResume {
  application?: Application
}

export type DocumentStatus = "all" | ResumeStatus | ApplicationStatus

export interface DocumentFilter {
  type: "all" | "resume" | "tailored"
  status: DocumentStatus
}
