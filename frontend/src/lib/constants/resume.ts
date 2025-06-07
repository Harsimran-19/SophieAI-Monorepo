import type { ResumeData } from "@/types/resume-content"

export const DEFAULT_RESUME_CONTENT: ResumeData = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
  },
  objective: "",
  experience: [],
  education: [],
  projects: [],
  skills: "",
}
