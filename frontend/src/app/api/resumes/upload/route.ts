import { NextResponse } from "next/server"
import { uploadResumeFile } from "@/actions/resumes/uploadResumeFile"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const result = await uploadResumeFile(formData)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("[API] Upload Resume Error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}
