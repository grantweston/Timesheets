"use client"

import * as React from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Send, Check, Bot, User, Clock } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { format } from "date-fns"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  status: "sending" | "sent" | "delivered"
}

interface TimeBlock {
  id: number
  start: number
  duration: number
  title: string
  client: string
  billable: boolean
  category: string
  description: string[]
  applications: string[]
}

const suggestions = [
  "I don't want to bill for lunch breaks",
  "Internal meetings should be non-billable",
  "Administrative work shouldn't be billed",
  "Don't bill for training time",
]

const initialTimeBlocks: TimeBlock[] = [
  {
    id: 1,
    start: 9,
    duration: 1,
    title: "Example Block",
    client: "",
    billable: true,
    category: "development",
    description: ["Add work description"],
    applications: [],
  },
  // More blocks...
]

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'll help you configure your non-billable time preferences. What activities would you like to mark as non-billable?",
      timestamp: new Date(),
      status: "delivered",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  function scrollToBottom() {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    // Simulate message being sent
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I've marked that as non-billable. Would you like to add any other activities to the non-billable list?",
          timestamp: new Date(),
          status: "delivered",
        },
      ])
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [isTyping]) //Corrected dependency

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-background">
      <div className="flex items-center gap-2 p-4 border-b">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isFirstInGroup = index === 0 || messages[index - 1].role !== message.role
            const isLastInGroup = index === messages.length - 1 || messages[index + 1].role !== message.role

            return (
              <div
                key={message.id}
                className={cn("flex gap-2", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "flex max-w-[80%] flex-col gap-1",
                    message.role === "user" ? "items-end" : "items-start",
                  )}
                >
                  {isFirstInGroup && (
                    <div className="flex items-center gap-2 px-2">
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                      <span className="text-xs text-muted-foreground">{format(message.timestamp, "h:mm a")}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm animate-slide-up",
                      message.role === "user" ? "bg-primary text-primary-foreground ml-8" : "bg-muted mr-8",
                      !isLastInGroup && (message.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"),
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && isLastInGroup && (
                    <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
                      {message.status === "sending" ? (
                        <Clock className="h-3 w-3 animate-pulse" />
                      ) : (
                        <Check className="h-3 w-3 text-primary" />
                      )}
                      {message.status}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
              <Bot className="h-4 w-4" />
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span
                  className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-4">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="animate-slide-up transition-all hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-4"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all hover:scale-105"
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

