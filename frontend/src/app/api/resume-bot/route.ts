import { vertex } from "@ai-sdk/google-vertex"
import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, resumeContent } = await req.json()
    
    const vertex = createVertex({
      project: 'subtle-fulcrum-361403',
      location: 'us-central1'
    })

    const model = vertex("gemini-1.0-pro")

    // Combine messages with resume context
    const contextualMessages = [
      {
        role: "system",
        content: `You are a helpful AI assistant analyzing a resume. Here's the resume content: ${resumeContent}`
      },
      ...messages
    ]

    const result = streamText({
      model,
      messages: contextualMessages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in POST request:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}