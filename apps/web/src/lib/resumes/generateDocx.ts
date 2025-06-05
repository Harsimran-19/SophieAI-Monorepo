import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx"

import type { ResumeData } from "@/types/resume-content"

/**
 * Generate a DOCX Blob from resume JSON content
 */
export async function generateDocxBlob(resumeData: ResumeData): Promise<Blob> {
  const { personalInfo, experience, education, projects, skills } = resumeData

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header: Name & Contact
          new Paragraph({
            text: personalInfo.name || "Your Name",
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            text: `${personalInfo.email || ""} | ${personalInfo.phone || ""} | ${personalInfo.location || ""}`,
          }),
          new Paragraph({ text: " " }),

          // Experience
          new Paragraph({
            text: "Experience",
            heading: HeadingLevel.HEADING_1,
          }),
          ...experience.map(
            (exp) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.position} at ${exp.company}`,
                    bold: true,
                  }),
                  new TextRun(`\n${exp.startDate} – ${exp.endDate}`),
                  new TextRun(`\n${exp.description}`),
                ],
                spacing: { after: 200 },
              })
          ),

          // Education
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_1,
          }),
          ...education.map(
            (edu) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.school}`, bold: true }),
                  new TextRun(
                    `\n${edu.degree} (${edu.startDate} – ${edu.endDate})`
                  ),
                ],
                spacing: { after: 200 },
              })
          ),

          // Projects
          new Paragraph({
            text: "Projects",
            heading: HeadingLevel.HEADING_1,
          }),
          ...projects.map(
            (proj) =>
              new Paragraph({
                children: [
                  new TextRun({ text: proj.name, bold: true }),
                  new TextRun(`\n${proj.description}`),
                ],
                spacing: { after: 200 },
              })
          ),

          // Skills
          new Paragraph({
            text: "Skills",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: skills,
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  return blob
}
