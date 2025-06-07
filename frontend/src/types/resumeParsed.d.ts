// Define enums or string literal unions for fixed values
type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Internship"
type LocationType = "On-site" | "Remote" | "Hybrid"

export interface BaseItem {
  id: string
}

export interface CardProps<T extends BaseItem> {
  item: T
  onDelete: () => void
  onUpdate: (updated: T) => void
}

export interface ResumeSection<T> {
  type: string
  data: T[]
}

export interface PersonalEntry {
  id: string
  name: string
  email: string
  phone: string
  address: string | null
  linkedin: string | null
  github: string | null
  website: string | null
}

export interface EducationEntry {
  id: string
  school: string
  degree: string
  location: string
  grade?: string
  courses?: string[]
  start_date: string // Format: YYYY-MM-DD
  end_date: string // Format: YYYY-MM-DD
}

export interface ExperienceEntry {
  id: string
  company: string
  job_title: string
  employment_type: EmploymentType
  location: string
  location_type: LocationType
  duration: string
  description: string[]
  start_date: string // Format: YYYY-MM-DD
  end_date: string // Format: YYYY-MM-DD
}

export interface ProjectEntry {
  id: string
  title: string
  description: string[]
  url?: string
  start_date: string // Format: YYYY-MM-DD
  end_date: string // Format: YYYY-MM-DD
}

export interface CertificateEntry {
  id: string
  title: string
  issuer: string
  credential_id?: string
  url?: string
  start_date: string // Format: YYYY-MM-DD
  end_date: string // Format: YYYY-MM-DD
}

export interface AwardEntry {
  id: string
  title: string
  issuer: string
  description?: string
  start_date: string // Format: YYYY-MM-DD
}

export interface ParsedResume {
  Personal: ResumeSection<PersonalEntry>
  Education: ResumeSection<EducationEntry>
  Experience: ResumeSection<ExperienceEntry>
  Projects: ResumeSection<ProjectEntry>
  Certificates: ResumeSection<CertificateEntry>
  Awards: ResumeSection<AwardEntry>
}

// Complete resume structure
interface ParsedResume {
  Education: ResumeSection<EducationEntry>
  Experience: ResumeSection<ExperienceEntry>
  Projects: ResumeSection<ProjectEntry>
  Certificates: ResumeSection<CertificateEntry>
  Awards: ResumeSection<AwardEntry>
}

export type {
  EmploymentType,
  LocationType,
  PersonalEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  CertificateEntry,
  AwardEntry,
  ResumeSection,
  ParsedResume,
}

export interface DatabaseEntry {
  id: string
  user_id: string
  resume_id: string
  created_at: string
  [key: string]: unknown
}

export interface PersonalDatabaseEntry extends DatabaseEntry {
  name: string
  email: string
  phone: string
  address: string | null
  linkedin: string | null
  github: string | null
  website: string | null
}

export interface EducationDatabaseEntry extends DatabaseEntry {
  school: string
  degree: string
  location: string
  grade?: string
  courses?: string[]
  start_date: string | null
  end_date: string | null
}

export interface ExperienceDatabaseEntry extends DatabaseEntry {
  company: string
  job_title: string
  employment_type: EmploymentType
  location_type: LocationType
  duration: string
  location: string
  description: string
  start_date: string | null
  end_date: string | null
}

export interface ProjectDatabaseEntry extends DatabaseEntry {
  title: string
  description: string
  start_date: string | null
  end_date: string | null
}

export interface CertificationDatabaseEntry extends DatabaseEntry {
  title: string
  issuer: string
  credential_id: string
  url?: string
  start_date: string
  end_date: string | null
}

export interface AwardDatabaseEntry extends DatabaseEntry {
  name: string
  issuer: string
  description?: string
  date: string | null
}
