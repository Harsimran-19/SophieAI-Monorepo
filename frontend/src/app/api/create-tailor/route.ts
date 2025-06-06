import { NextResponse } from "next/server"
import { createApplication } from "@/actions/tailored_applications/createApplication"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    // Get form data values
    const resumeId = formData.get("resumeId")
    const jobTitle = formData.get("jobTitle")
    const jobDescription = formData.get("jobDescription")
    const jobUrl = formData.get("jobUrl")
    const companyName = formData.get("companyName")
    const companyDescription = formData.get("companyDescription")
    const shouldTailorResume = formData.get("shouldTailorResume") === "true"
    const generateCoverLetter = formData.get("generateCoverLetter") === "true"

    // Validate required fields
    if (!resumeId || !jobTitle || !jobDescription || !companyName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      )
    }

    console.log("📝 API received data:", {
      resumeId,
      jobTitle,
      jobDescription: jobDescription.toString().substring(0, 100) + "...",
      jobUrl,
      companyName,
      shouldTailorResume,
      generateCoverLetter,
    })

    const result = await createApplication({
      resumeId: resumeId.toString(),
      jobTitle: jobTitle.toString(),
      jobDescription: jobDescription.toString(),
      jobUrl: jobUrl?.toString() || undefined,
      companyName: companyName.toString(),
      companyDescription: companyDescription?.toString() || undefined,
      shouldTailorResume,
      generateCoverLetter,
    })

    console.log("✅ API operation result:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Error in create-tailor API:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create tailored application",
      },
      { status: 500 }
    )
  }
}
