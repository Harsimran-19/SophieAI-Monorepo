export type ApplicationStatus = "Completed" | "In Progress" | "Failed"

export interface Job {
  id: string
  company_id: string
  job_title: string
  job_url?: string
  job_description: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  resume_id: string
  tailored_resume_id?: string
  cover_letter_id?: string
  job_id: string
  company_id: string
  applied_date: string
  status: ApplicationStatus
  notes?: string
  created_at: string
  updated_at: string
  job: Job
  company: Company
}
