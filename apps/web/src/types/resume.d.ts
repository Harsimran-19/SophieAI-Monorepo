// app/types/resume.ts
export interface AnalyzeResumeRequest {
  target_roles: string[]
}
// types/resume.ts
export interface ResumeAnalysisResult {
  id: string
  user_id: string
  overall_score: number
  general_review: string
  section_scores: {
    contact: number
    summary: number
    education: number
    skills: number
    experience: number
  }
  job_analyses: Array<{
    title: string
    score: number
    review: string
    section_scores: {
      contact: number
      summary: number
      education: number
      skills: number
      experience: number
    }
  }>
  strengths: string[]
  weaknesses: string[]
  created_at: string
  updated_at: string
}
export interface JobAnalysis {
  title: string;
  score: number;
  review: string;
  section_scores: {
    [key: string]: number;
  };
}