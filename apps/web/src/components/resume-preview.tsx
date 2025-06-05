import { Card, CardContent } from "@/components/ui/card"

interface ResumePreviewProps {
  data: any
}

export function ResumePreview({ data }: ResumePreviewProps) {
  // In a real application, this would render different templates based on the template prop
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4 text-center">
            <h1 className="text-2xl font-bold">{data.personalInfo.fullName}</h1>
            <div className="mt-2 flex justify-center space-x-4 text-sm text-muted-foreground">
              <span>{data.personalInfo.email}</span>
              <span>|</span>
              <span>{data.personalInfo.phone}</span>
              <span>|</span>
              <span>{data.personalInfo.location}</span>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">Professional Summary</h2>
            <p className="text-sm">{data.personalInfo.summary}</p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Experience</h2>
            <div className="space-y-4">
              {data.experiences.map((exp: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{exp.position}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                    </div>
                    <p className="text-sm">
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                  <p className="mt-1 text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {edu.institution}
                      </p>
                    </div>
                    <p className="text-sm">{edu.graduationDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill: any, index: number) => (
                <div
                  key={index}
                  className="rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {skill.name} {skill.level && `(${skill.level})`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
