export interface PersonalInfo {
  name: string
  location: string
  phone: string
  email: string
  website?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

export interface Education {
  id: string
  school: string
  degree: string
  gpa: string
  startDate: string
  endDate: string
  coursework: string
}

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  affiliation: string
}

export interface ResumeData {
  personalInfo: PersonalInfo
  objective: string
  experience: Experience[]
  education: Education[]
  projects: Project[]
  skills: string
}
