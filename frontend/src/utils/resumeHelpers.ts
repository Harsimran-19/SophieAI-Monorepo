import type { ParsedResume } from "@/types/resumeParsed"

// Function to add a new section
export const addSectionData = (prevData: ParsedResume, type: string) => {
  const emptyData = {
    education: {
      id: Math.random().toString(36).substr(2, 9),
      school: "",
      degree: "",
      start_date: "",
      end_date: "",
      grade: "",
      courses: [],
    },
    experience: {
      id: Math.random().toString(36).substr(2, 9),
      company: "",
      job_title: "",
      employment_type: "Full-time",
      location: "",
      location_type: "On-site",
      start_date: "",
      end_date: "",
      duration: "",
      description: [],
    },
    project: {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      description: [],
      url: "",
    },
    certificate: {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      issuer: "",
      start_date: "",
      end_date: "",
      credential_id: "",
      url: "",
    },
    award: {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      issuer: "",
      start_date: "",
      description: "",
    },
  }

  return {
    ...prevData,
    [type as keyof ParsedResume]: {
      ...prevData[type as keyof ParsedResume],
      data: [
        ...prevData[type as keyof ParsedResume].data,
        emptyData[type.toLowerCase() as keyof typeof emptyData],
      ],
    },
  }
}

// Function to update section data
export const updateSectionData = (
  prevData: ParsedResume,
  type: string,
  id: string,
  field: string,
  value: string | string[]
) => {
  return {
    ...prevData,
    [type as keyof ParsedResume]: {
      ...prevData[type as keyof ParsedResume],
      data: prevData[type as keyof ParsedResume].data.map(
        (entry: { id: string }) =>
          entry.id === id ? { ...entry, [field]: value } : entry
      ),
    },
  }
}

// Function to delete a section
export const deleteSection = (
  prevData: ParsedResume,
  type: string,
  id: string
) => {
  return {
    ...prevData,
    [type as keyof ParsedResume]: {
      ...prevData[type as keyof ParsedResume],
      data: prevData[type as keyof ParsedResume].data.filter(
        (entry: { id: string }) => entry.id !== id
      ),
    },
  }
}
