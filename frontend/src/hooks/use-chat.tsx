'use client'
import { useState, useCallback } from "react"
import { useChat as useAIChat } from "ai/react"
import { Message } from "ai/react";
import { v4 as uuidv4 } from "uuid"
import { UserProfile } from '@/types/user-profile'
import { fetchResumeContent } from "@/lib/resumeUtils"

export function useChat(profile: UserProfile|null) {
    const [chatId, setChatId] = useState<string | null>(null)
    const [isStarted, setIsStarted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resumeContent, setResumeContent] = useState<string | null>(null)

    // Function to fetch resume content
    

    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useAIChat({
        api: "/api/resume-bot",
        headers: {
            'Chat-Id': chatId || '',
        },
        body: {
            resumeContent,
            chatId
        },
        onResponse: (response) => {
            if (!response.ok) {
                setError(`HTTP error! status: ${response.status}`)
            } else {
                setError(null)
            }
        },
    })

    const startChat = useCallback(async () => {
        if (!profile?.resume_id) return; // Early return if no valid profile
        try {
            const newChatId = uuidv4()
            setChatId(newChatId)
            
            // Fetch resume content
            const content = await fetchResumeContent(profile.resume_id)
            setResumeContent(content)
            
            // Initialize chat with system message containing resume
            const systemMessage: Message = {
                id: uuidv4(),
                role: "system", // "system" should already be valid in the union type
                content: `You are a helpful AI assistant analyzing the following resume: ${content}
                         Your task is to help answer questions about the resume and provide insights.
                         Be concise and professional in your responses.`,
            };
            if(isStarted){
            setMessages([systemMessage])
            }
            setIsStarted(true)
            setError(null)
        } catch (error) {
            console.error("Error starting chat:", error)
            setError("Failed to start chat")
        }
    }, [profile])

    const sendMessage = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (!chatId) return

            try {
                handleSubmit(e)
            } catch (error) {
                console.error("Error sending message:", error)
                setError("Failed to send message")
            }
        },
        [chatId, handleSubmit],
    )

    return {
        messages,
        input,
        handleInputChange,
        sendMessage: profile?.resume_id ? sendMessage : () => {}, // No-op if no valid profile
        isLoading,
        isStarted,
        startChat,
        error,
        resumeContent
    }
}