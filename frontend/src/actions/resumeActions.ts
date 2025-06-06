"use server"

import api from "@/services/apiService"
import { v4 as uuidv4 } from "uuid"

import type { ParsedResume } from "@/types/resumeParsed"
import { getApiUrl } from "@/config/apiEndpoints"

import { downloadResume } from "@/lib/resumeUtils"
import { createClient } from "@/lib/supabase/server"

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Update the interface to match the API response structure
interface SectionAnalysis {
  section: string
  grade: number
  general_advice: {
    strengths: string[]
    areas_for_improvement: string[]
  }
}

// Update the interface for the description analysis response
interface BulletPointAnalysis {
  original: string
  reasons: string[]
  suggestion: string
}

interface DescriptionAnalysis {
  section: string
  entry_id: string
  bullet_advice: BulletPointAnalysis[]
}

/**
 * Extracts the text from the resume using the resume_id
 * @param resumeId - The resume_id of the resume to extract the text from
 * @returns The extracted text from the resume
 * api endpoint: /extract-pdf-text: input: a pdf file, returns: extracted_text (string)
 */
export async function extractResumeText(
  resumeId: string
): Promise<ApiResponse<string>> {
  try {
    console.log("🔍 Getting resume file from supabase")
    const {
      success: downloadSuccess,
      data: fileData,
      error: downloadError,
    } = await downloadResume(resumeId)

    if (!downloadSuccess || !fileData) {
      throw new Error(downloadError || "Failed to download resume")
    }

    console.log("📂 Resume file downloaded")

    const formData = new FormData()
    formData.append("file", fileData, "resume.pdf")

    // Keep original API endpoint for text extraction
    const { data: extractedText } = await api.post<{ extracted_text: string }>(
      "/extract-pdf-text",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (!extractedText?.extracted_text) {
      throw new Error("No text extracted from resume")
    }

    console.log(
      "👩🏻‍💻 Extracted text from resume",
      extractedText.extracted_text.substring(0, 100) + "..."
    )

    return {
      success: true,
      data: extractedText.extracted_text,
    }
  } catch (error) {
    console.error("Error extracting resume text:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Parses the resume using the extracted text
 * @param extractedText - The extracted text from the resume
 * @returns a parsed resume object
 * api endpoint: /parse-resume, input: extractedText, returns: parsedResume
 */
export async function parseResume(
  extractedText: string
): Promise<ApiResponse<ParsedResume>> {
  try {
    console.log(
      "📤 Sending text to parse:",
      extractedText.substring(0, 100) + "..."
    )

    const response = await fetch(
      `${getApiUrl("PARSE_RESUME")}?resume_text=${encodeURIComponent(extractedText)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `🏞️ Failed to parse resume: ${response.statusText}. ${
          errorData ? JSON.stringify(errorData) : ""
        }`
      )
    }

    const parsedResume = await response.json()
    console.log("📝 Raw response from parser:", parsedResume)

    // Function to add IDs to section data
    const addIdsToSection = <T extends { id?: string | number }>(
      items: T[]
    ): (T & { id: string })[] => {
      return items.map((item) => ({
        ...item,
        id: uuidv4(),
      }))
    }

    const formattedData: ParsedResume = {
      Personal: {
        type: "Personal",
        data: addIdsToSection(parsedResume.Personal?.data || []),
      },
      Education: {
        type: "Education",
        data: addIdsToSection(parsedResume.Education?.data || []),
      },
      Experience: {
        type: "Experience",
        data: addIdsToSection(parsedResume.Experience?.data || []),
      },
      Projects: {
        type: "Projects",
        data: addIdsToSection(parsedResume.Projects?.data || []),
      },
      Certificates: {
        type: "Certificates",
        data: addIdsToSection(parsedResume.Certificates?.data || []),
      },
      Awards: {
        type: "Awards",
        data: addIdsToSection(parsedResume.Awards?.data || []),
      },
    }

    console.log(
      "🎨 Parsed resume fit into ParsedResume type",
      formattedData.Personal.data
    )
    console.log(
      "🎨 Parsed resume fit into ParsedResume type",
      formattedData.Education.data
    )
    return {
      success: true,
      data: formattedData,
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Fetches analysis and suggestions for a specific resume section
 * @param sectionType - The type of section (Education, Experience, etc.)
 * @param sectionData - The current data for that section
 * @returns Analysis and suggestions for the section
 */
export async function getSectionAnalysis(
  sectionType: string,
  sectionData: unknown[]
): Promise<ApiResponse<SectionAnalysis>> {
  try {
    console.log(`📊 Requesting analysis for ${sectionType} section`)

    const response = await fetch(getApiUrl("SECTION_ANALYSIS"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_type: sectionType,
        section_data: sectionData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Failed to get section analysis: ${response.statusText}. ${
          errorData ? JSON.stringify(errorData) : ""
        }`
      )
    }

    const analysisData: SectionAnalysis = await response.json()
    console.log(`✨ Received analysis for ${sectionType} section:`, {
      section: analysisData.section,
      grade: analysisData.grade,
      strengthsCount: analysisData.general_advice.strengths.length,
      improvementsCount:
        analysisData.general_advice.areas_for_improvement.length,
    })

    return {
      success: true,
      data: analysisData,
    }
  } catch (error) {
    console.error(`Error analyzing ${sectionType} section:`, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Fetches detailed analysis for description fields in Experience and Project sections
 * @param sectionType - The type of section ("Experience" or "Projects")
 * @param entryId - The ID of the specific entry
 * @param descriptions - Array of bullet points to analyze
 * @returns Analysis and suggestions for each bullet point
 */
export async function getDescriptionAnalysis(
  sectionType: "Experience" | "Projects",
  entryId: string,
  descriptions: string[]
): Promise<ApiResponse<DescriptionAnalysis>> {
  try {
    console.log(
      `📝 Requesting description analysis for ${sectionType} entry: ${entryId}`,
      {
        descriptions,
      }
    )

    const response = await fetch(getApiUrl("DESCRIPTION_ANALYSIS"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_type: sectionType,
        entry_id: entryId,
        section_data: {
          descriptions: descriptions,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        `Failed to get description analysis: ${response.statusText}. ${
          errorData ? JSON.stringify(errorData) : ""
        }`
      )
    }

    const analysisData: DescriptionAnalysis = await response.json()
    console.log(`✨ Analysis result for entry ${entryId}:`, analysisData)

    return {
      success: true,
      data: analysisData,
    }
  } catch (error) {
    console.error(`Error analyzing ${sectionType} descriptions:`, error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Fetches existing resume data from the database
 * @param userId - The user ID of the resume owner
 * @returns The existing resume data
 */
export async function getExistingResumeData(userId: string) {
  try {
    const supabase = await createClient()

    // Check for existing education entries
    const { data: educationData, error: educationError } = await supabase
      .from("education_entries")
      .select("*")
      .eq("user_id", userId)

    if (educationError) throw educationError

    // If no education entries found, return null
    if (!educationData?.length) return null

    // Fetch all other entries
    const [
      { data: personalData },
      { data: experienceData },
      { data: projectData },
      { data: certificateData },
      { data: awardData },
    ] = await Promise.all([
      supabase.from("personal_entries").select("*").eq("user_id", userId),
      supabase.from("experience_entries").select("*").eq("user_id", userId),
      supabase.from("project_entries").select("*").eq("user_id", userId),
      supabase.from("certificate_entries").select("*").eq("user_id", userId),
      supabase.from("award_entries").select("*").eq("user_id", userId),
    ])

    // Format data into ParsedResume structure
    const formattedData: ParsedResume = {
      Personal: {
        type: "Personal",
        data:
          personalData?.map((entry) => ({
            id: entry.id,
            name: entry.name,
            email: entry.email,
            phone: entry.phone,
            address: entry.address,
            linkedin: entry.linkedin,
            github: entry.github,
            website: entry.website,
          })) || [],
      },

      Education: {
        type: "Education",
        data: educationData.map((entry) => ({
          id: entry.id,
          school: entry.school,
          degree: entry.degree,
          field_of_study: entry.field_of_study,
          location: entry.location,
          start_date: entry.start_date,
          end_date: entry.end_date,
          gpa: entry.gpa,
        })),
      },
      Experience: {
        type: "Experience",
        data:
          experienceData?.map((entry) => ({
            id: entry.id,
            company: entry.company,
            job_title: entry.job_title,
            location: entry.location,
            location_type: entry.location_type || "On-site",
            employment_type: entry.employment_type,
            start_date: entry.start_date,
            end_date: entry.end_date,
            duration: entry.duration || "",
            description: entry.description,
          })) || [],
      },
      Projects: {
        type: "Projects",
        data:
          projectData?.map((entry) => ({
            id: entry.id,
            title: entry.title,
            description: entry.description,
            technologies: entry.technologies,
            start_date: entry.start_date,
            end_date: entry.end_date,
          })) || [],
      },
      Certificates: {
        type: "Certificates",
        data:
          certificateData?.map((entry) => ({
            id: entry.id,
            title: entry.name,
            issuer: entry.issuer,
            start_date: entry.start_date,
            end_date: entry.end_date,
            credential_id: entry.credential_id,
          })) || [],
      },
      Awards: {
        type: "Awards",
        data:
          awardData?.map((entry) => ({
            id: entry.id,
            title: entry.title,
            issuer: entry.issuer,
            start_date: entry.start_date,
            end_date: entry.end_date,
            description: entry.description,
          })) || [],
      },
    }

    return {
      success: true,
      data: formattedData,
    }
  } catch (error) {
    console.error("Error fetching existing resume data:", error)
    return {
      success: false,
      error: "Failed to fetch existing resume data",
    }
  }
}

/**
 * Downloads the resume as a PDF
 * @param parsedResume - The parsed resume data
 * @returns The base64 encoded PDF
 */
export async function downloadResumePdf(parsedResume: ParsedResume) {
  try {
    console.log("📝 Formatting resume data for PDF")

    const formattedData = {
      resume: {
        personal: parsedResume.Personal.data[0]
          ? {
              name: parsedResume.Personal.data[0].name,
              phone: parsedResume.Personal.data[0].phone,
              email: parsedResume.Personal.data[0].email,
              github: parsedResume.Personal.data[0].github,
              linkedin: parsedResume.Personal.data[0].linkedin,
            }
          : null,
        work_experience: parsedResume.Experience.data.map((exp) => ({
          role: exp.job_title,
          company: exp.company,
          location: exp.location,
          from_date: exp.start_date,
          to_date: exp.end_date,
          description: Array.isArray(exp.description)
            ? exp.description
            : [exp.description],
        })),
        projects: parsedResume.Projects.data.map((proj) => ({
          name: proj.title,
          type: "Project",
          link: null,
          resources: null,
          from_date: proj.start_date,
          to_date: proj.end_date,
          description: Array.isArray(proj.description)
            ? proj.description
            : [proj.description],
        })),
        education: parsedResume.Education.data.map((edu) => ({
          degree: edu.degree,
          university: edu.school,
          from_date: edu.start_date,
          to_date: edu.end_date,
          courses: edu.courses || [],
        })),
        achievements: parsedResume.Awards.data
          .map((award) => award.description)
          .filter(Boolean),
      },
    }

    console.log(
      "📤 Sending data to PDF endpoint:",
      JSON.stringify(formattedData, null, 2)
    )

    const response = await fetch(
      getApiUrl("DOWNLOAD_RESUME_PDF"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`)
    }

    // Convert to base64 string
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    return base64
  } catch (error) {
    console.error("Error downloading resume PDF:", error)
    throw error
  }
}


