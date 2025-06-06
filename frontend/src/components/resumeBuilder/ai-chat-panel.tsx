"use client"

import { useState } from "react"
import { Bot, User } from "lucide-react"

import type { ResumeData } from "@/types/resume-content"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AiChatPanelProps {
  onSuggestion: (suggestion: Partial<ResumeData>) => void
  onCollapse?: () => void
}

export function AiChatPanel({ onSuggestion, onCollapse }: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi, there! Welcome to Resume Copilot, where I'll assist you in creating an outstanding resume.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const quickActions = [
    "Paste my information",
    "Optimize text",
    "Modify the copy",
  ]

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I'd be happy to help you with that! Could you provide more details about what specific aspect of your resume you'd like me to assist with?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {
    if (onSuggestion) {
      onSuggestion({
        [action]: "This is a test suggestion",
      })
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: action,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""
      switch (action) {
        case "Paste my information":
          response =
            "I can help you organize your information. Please paste your details and I'll help format them properly for your resume."
          break
        case "Optimize text":
          response =
            "I'll help you optimize your resume text to make it more impactful and ATS-friendly. Which section would you like me to focus on?"
          break
        case "Modify the copy":
          response =
            "I can help you improve the wording and tone of your resume content. What specific changes are you looking for?"
          break
        default:
          response = "How can I assist you with your resume today?"
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Resume Copilot</h2>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "assistant" && (
                <Avatar className="mt-1 size-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === "user"
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.type === "user" && (
                <Avatar className="mt-1 size-8">
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start gap-3">
              <Avatar className="mt-1 size-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl rounded-bl-md bg-gray-100 p-4">
                <div className="flex space-x-1">
                  <div className="size-2 animate-bounce rounded-full bg-gray-400"></div>
                  <div
                    className="size-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="size-2 animate-bounce rounded-full bg-gray-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions and Input */}
      <div className="space-y-4 border-t border-gray-200 p-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {action}
            </Button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full"
          />
          <Button
            onClick={handleSend}
            size="sm"
            className="rounded-full bg-gray-900 px-6 hover:bg-gray-800"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-20 right-4">
        <Button
          size="sm"
          className="size-12 rounded-full bg-orange-500 p-0 shadow-lg hover:bg-orange-600"
        >
          <Bot className="size-6 text-white" />
        </Button>
      </div>
    </div>
  )
}
