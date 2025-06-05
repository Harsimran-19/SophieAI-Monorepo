"use client"

import { useCallback } from "react"
import { Save } from "lucide-react"

import type { ResumeData } from "@/types/resume-content"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"

import { EducationSection } from "./sections/EducationSection"
import { ExperienceSection } from "./sections/ExperienceSection"
import { PersonalInfoSection } from "./sections/PersonalInfoSection"
import { ProjectsSection } from "./sections/ProjectsSection"
import { SkillSection } from "./sections/SkillSection"

interface ResumeFormPanelProps {
  data: ResumeData
  onDataChange: (data: ResumeData) => void
  onCollapse?: () => void
  onSave: () => Promise<void>
  isSaving?: boolean
}

export function ResumeFormPanel({
  data,
  onDataChange,
  onCollapse,
  onSave,
  isSaving = false,
}: ResumeFormPanelProps) {
  const updatePersonalInfo = useCallback(
    (field: string, value: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        personalInfo: { ...data.personalInfo, [field]: value },
      })
    },
    [data, isSaving, onDataChange]
  )

  const addExperience = useCallback(() => {
    if (isSaving) return // Prevent updates while saving
    const newExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    onDataChange({
      ...data,
      experience: [...data.experience, newExperience],
    })
  }, [data, isSaving, onDataChange])

  const updateExperience = useCallback(
    (id: string, field: string, value: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        experience: data.experience.map((exp) =>
          exp.id === id ? { ...exp, [field]: value } : exp
        ),
      })
    },
    [data, isSaving, onDataChange]
  )

  const removeExperience = useCallback(
    (id: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        experience: data.experience.filter((exp) => exp.id !== id),
      })
    },
    [data, isSaving, onDataChange]
  )

  const addEducation = useCallback(() => {
    if (isSaving) return // Prevent updates while saving
    const newEducation = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      gpa: "",
      startDate: "",
      endDate: "",
      coursework: "",
    }
    onDataChange({
      ...data,
      education: [...data.education, newEducation],
    })
  }, [data, isSaving, onDataChange])

  const updateEducation = useCallback(
    (id: string, field: string, value: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        education: data.education.map((edu) =>
          edu.id === id ? { ...edu, [field]: value } : edu
        ),
      })
    },
    [data, isSaving, onDataChange]
  )

  const removeEducation = useCallback(
    (id: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        education: data.education.filter((edu) => edu.id !== id),
      })
    },
    [data, isSaving, onDataChange]
  )

  const addProject = useCallback(() => {
    if (isSaving) return // Prevent updates while saving
    const newProject = {
      id: Date.now().toString(),
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      affiliation: "",
    }
    onDataChange({
      ...data,
      projects: [...data.projects, newProject],
    })
  }, [data, isSaving, onDataChange])

  const updateProject = useCallback(
    (id: string, field: string, value: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        projects: data.projects.map((proj) =>
          proj.id === id ? { ...proj, [field]: value } : proj
        ),
      })
    },
    [data, isSaving, onDataChange]
  )

  const removeProject = useCallback(
    (id: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        projects: data.projects.filter((proj) => proj.id !== id),
      })
    },
    [data, isSaving, onDataChange]
  )

  const updateSkills = useCallback(
    (skills: string) => {
      if (isSaving) return // Prevent updates while saving
      onDataChange({
        ...data,
        skills: skills,
      })
    },
    [data, isSaving, onDataChange]
  )

  const handleSave = useCallback(async () => {
    if (isSaving) return
    await onSave()
  }, [isSaving, onSave])

  return (
    <div className="flex h-full flex-col bg-white">
      <ScrollArea className="h-full pr-4" type="hover">
        <div
          className={`flex flex-col gap-6 p-6 transition-opacity duration-200 ${isSaving ? "pointer-events-none opacity-50" : ""}`}
        >
          <PersonalInfoSection
            personalInfo={data.personalInfo}
            objective={data.objective}
            onChange={updatePersonalInfo}
            onUpdateObjective={(value) =>
              !isSaving && onDataChange({ ...data, objective: value })
            }
          />

          <EducationSection
            education={data.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />

          <SkillSection
            skills={data.skills}
            onAdd={(skill) =>
              !isSaving &&
              updateSkills(data.skills ? `${data.skills}\n${skill}` : skill)
            }
            onRemove={(skill) =>
              !isSaving &&
              updateSkills(
                data.skills
                  .split("\n")
                  .filter((s) => s !== skill)
                  .join("\n")
              )
            }
            onUpdate={updateSkills}
          />

          <ExperienceSection
            experience={data.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onRemove={removeExperience}
          />

          <ProjectsSection
            projects={data.projects}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        </div>
      </ScrollArea>

      {/* Save Button */}
      <div className="border-t border-gray-200 bg-white/50 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/50">
        <Button
          onClick={handleSave}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <Spinner className="mr-2 size-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
