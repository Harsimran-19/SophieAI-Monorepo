"use client"

import type { ResumeData } from "@/types/resume-content"

interface DocumentEditorProps {
  data: ResumeData
}

export function DocumentEditor({ data }: DocumentEditorProps) {
  const formatDate = (date: string) => {
    if (!date) return ""
    return date.replace("-", "/")
  }

  const formatSkills = (skills: string) => {
    if (!skills) return null
    return skills
      .split("\n")
      .filter((line) => line.trim())
      .map((line, index) => (
        <div key={index} className="mb-1">
          {line.trim().startsWith("•") || line.trim().startsWith("-") ? (
            <span>{line}</span>
          ) : (
            <span>• {line}</span>
          )}
        </div>
      ))
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-4">
      <div className="flex justify-center">
        <div
          id="resume-content"
          className="bg-white p-4 shadow-md"
          style={{
            width: "8.5in",
            minHeight: "11in",
            padding: "1in",
            fontFamily: "Times New Roman, serif",
            fontSize: "12pt",
            lineHeight: "1.4",
          }}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="mb-1 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.personalInfo.name || "Your Name"}
              </h1>
              <div className="mt-1 flex justify-center gap-x-2 text-sm text-gray-700">
                {data.personalInfo.phone && (
                  <>
                    <span>{data.personalInfo.phone}</span>
                    {(data.personalInfo.email ||
                      data.personalInfo.website ||
                      data.personalInfo.location) && (
                      <span className="text-gray-400">|</span>
                    )}
                  </>
                )}
                {data.personalInfo.email && (
                  <>
                    <span>{data.personalInfo.email}</span>
                    {(data.personalInfo.website ||
                      data.personalInfo.location) && (
                      <span className="text-gray-400">|</span>
                    )}
                  </>
                )}
                {data.personalInfo.website && (
                  <>
                    <span className="text-blue-600">
                      {data.personalInfo.website}
                    </span>
                    {data.personalInfo.location && (
                      <span className="text-gray-400">|</span>
                    )}
                  </>
                )}
                {data.personalInfo.location && (
                  <span>{data.personalInfo.location}</span>
                )}
              </div>
            </div>

            {/* Section Template (reusable) */}
            {data.education.length > 0 && (
              <section>
                <h2 className="mb-2 border-b border-orange-200 pb-1 text-lg font-bold uppercase tracking-wider text-orange-600">
                  Education
                </h2>
                <div className="space-y-3">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between">
                        <div>
                          <span className="font-bold">{edu.school}</span>
                          {edu.degree && <span>, {edu.degree}</span>}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(edu.startDate)} -{" "}
                          {formatDate(edu.endDate)}
                        </div>
                      </div>
                      {edu.gpa && <div className="text-sm">GPA: {edu.gpa}</div>}
                      {edu.coursework && (
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">
                            Relevant coursework:
                          </span>{" "}
                          {edu.coursework}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.skills && (
              <section>
                <h2 className="mb-2 border-b border-orange-200 pb-1 text-lg font-bold uppercase tracking-wider text-orange-600">
                  Skills
                </h2>
                <div className="space-y-1 text-sm">
                  {formatSkills(data.skills)}
                </div>
              </section>
            )}

            {data.experience.length > 0 && (
              <section>
                <h2 className="mb-2 border-b border-orange-200 pb-1 text-lg font-bold uppercase tracking-wider text-orange-600">
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="text-sm text-gray-800">
                      <div className="flex justify-between font-medium text-gray-900">
                        <div>
                          {exp.position} -{" "}
                          <span className="font-normal">{exp.company}</span>
                        </div>
                        <div className="text-gray-600">
                          {formatDate(exp.startDate)} -{" "}
                          {formatDate(exp.endDate) || "Present"}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="mt-1 whitespace-pre-line text-gray-800">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.projects.length > 0 && (
              <section>
                <h2 className="mb-2 border-b border-orange-200 pb-1 text-lg font-bold uppercase tracking-wider text-orange-600">
                  Projects
                </h2>
                <div className="space-y-3">
                  {data.projects.map((project) => (
                    <div key={project.id} className="text-sm text-gray-800">
                      <div className="flex justify-between font-medium text-gray-900">
                        <div>{project.name}</div>
                        <div className="text-gray-600">
                          {formatDate(project.startDate)} -{" "}
                          {formatDate(project.endDate)}
                        </div>
                      </div>
                      {project.affiliation && (
                        <div className="italic text-gray-700">
                          {project.affiliation}
                        </div>
                      )}
                      {project.description && (
                        <p className="mt-1 whitespace-pre-line text-gray-800">
                          {project.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
