"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, ImageIcon, Send, Loader2, X, Tractor, TreesIcon as Plant } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  attachments?: string[]
}

export default function FarmerAIAdvisor() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingText, setRecordingText] = useState("")
  const [textInput, setTextInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [activeTab, setActiveTab] = useState("text")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your farming assistant. How can I help you today? You can ask me about crop diseases, soil conditions, weather impacts, or any other farming questions. Feel free to share images or voice recordings to help me understand your situation better.",
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Don't submit if there's no content
    if (!textInput && !recordingText && selectedImages.length === 0) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textInput || recordingText || "I've shared some images with you.",
      attachments: selectedImages.length > 0 ? [...selectedImages] : undefined,
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])

    // Reset form inputs
    setTextInput("")
    setRecordingText("")
    setSelectedImages([])
    setActiveTab("text")

    // Show loading state
    setIsSubmitting(true)

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      // Sample AI responses based on content
      let aiResponse = ""

      if (userMessage.content.toLowerCase().includes("pest") || userMessage.content.toLowerCase().includes("insect")) {
        aiResponse =
          "Based on what you've shared, it looks like you might be dealing with aphids. These small pests can multiply quickly and damage crops. I recommend trying a neem oil solution as an organic treatment. Mix 2 tablespoons of neem oil with 1 gallon of water and spray affected plants early in the morning or late evening."
      } else if (
        userMessage.content.toLowerCase().includes("soil") ||
        userMessage.content.toLowerCase().includes("fertilizer")
      ) {
        aiResponse =
          "Your soil appears to be lacking in nitrogen based on the yellowing of the lower leaves. Consider applying a balanced organic fertilizer with an NPK ratio of 10-10-10. For a more precise recommendation, a soil test would be beneficial to determine exact nutrient deficiencies."
      } else if (
        userMessage.content.toLowerCase().includes("weather") ||
        userMessage.content.toLowerCase().includes("rain")
      ) {
        aiResponse =
          "With the current weather patterns, I'd recommend preparing for potential water stress. Consider setting up drip irrigation for your most valuable crops. Also, applying mulch around plants can help retain soil moisture during dry periods."
      } else if (userMessage.attachments && userMessage.attachments.length > 0) {
        aiResponse =
          "Thank you for sharing these images. I can see signs of what appears to be early blight on your tomato plants. This fungal disease thrives in warm, humid conditions. I recommend removing affected leaves, improving air circulation around plants, and applying a copper-based fungicide approved for organic farming."
      } else if (userMessage.content.includes("voice note recorded")) {
        aiResponse =
          "I've analyzed your voice recording about crop rotation. For your specific situation, I'd recommend following a three-year rotation plan: legumes (like beans) in year one to fix nitrogen, followed by heavy feeders like corn in year two, then leafy greens in year three. This will help break pest cycles and maintain soil health."
      } else {
        aiResponse =
          "Thanks for your question. Based on the information you've provided, I'd recommend monitoring your crop closely for the next few days. If you notice any changes, please share more details or images so I can provide more specific advice. In the meantime, ensure adequate irrigation and consider a light application of compost tea as a preventative measure."
      }

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
        },
      ])

      setIsSubmitting(false)
    }, 2000)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string)
          setSelectedImages((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const audioChunks: BlobPart[] = []

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks)

        // In a real app, you would send this blob to a speech-to-text service
        // For demo purposes, we'll just set some placeholder text
        setRecordingText("I've recorded a voice note about crop rotation and soil management techniques.")

        // Stop all tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop())
      })

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Could not access microphone. Please check your browser permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    setIsRecording(false)

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="grid grid-rows-[1fr_auto] h-[80vh] md:h-[70vh]">
      <Card className="border-[#5a7302]/20 shadow-md flex flex-col h-full">
        <CardHeader className="bg-[#e9f0db] rounded-t-lg">
          <CardTitle className="text-[#2c5f2d] flex items-center gap-2">
            <Plant className="h-5 w-5" />
            FarmAssist AI Advisor
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/placeholder.svg" alt="AI" />
                  <AvatarFallback className="bg-[#2c5f2d] text-white">AI</AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] ${message.role === "user" ? "bg-[#5a7302] text-white" : "bg-[#e9f0db] text-[#2c5f2d]"} p-3 rounded-lg`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {message.attachments.map((src, index) => (
                      <img
                        key={index}
                        src={src || "/placeholder.svg"}
                        alt={`Attachment ${index + 1}`}
                        className="rounded-md max-h-32 w-auto object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-[#5a7302] text-white">
                    <Tractor className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isSubmitting && (
            <div className="flex justify-start gap-2">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarImage src="/placeholder.svg" alt="AI" />
                <AvatarFallback className="bg-[#2c5f2d] text-white">AI</AvatarFallback>
              </Avatar>
              <div className="bg-[#e9f0db] p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-[#2c5f2d] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 bg-[#2c5f2d] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-[#2c5f2d] rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="text" className="data-[state=active]:bg-[#5a7302] data-[state=active]:text-white">
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="data-[state=active]:bg-[#5a7302] data-[state=active]:text-white">
                  Images
                </TabsTrigger>
                <TabsTrigger value="voice" className="data-[state=active]:bg-[#5a7302] data-[state=active]:text-white">
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-0">
                <Textarea
                  placeholder="Ask about crop diseases, soil conditions, weather impacts..."
                  className="min-h-[100px] border-[#5a7302]/30 focus:border-[#5a7302]"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-0">
                <div
                  className="border-2 border-dashed border-[#5a7302]/30 rounded-md p-6 text-center cursor-pointer hover:bg-[#e9f0db]/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-10 w-10 text-[#5a7302]/70" />
                  <p className="mt-2 text-sm text-[#2c5f2d]">Share photos of your crops, soil, or pests</p>
                  <p className="text-xs text-[#5a7302]/70 mt-1">Click to upload or drag and drop</p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {selectedImages.map((src, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`Uploaded image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md border border-[#5a7302]/30"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="voice" className="space-y-4 mt-0">
                <div className="border rounded-md p-6 flex flex-col items-center justify-center">
                  {isRecording ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-lg font-medium mb-2">Recording... {formatTime(recordingTime)}</p>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={stopRecording}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Stop Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      {recordingText ? (
                        <div className="mb-4">
                          <p className="text-sm text-[#2c5f2d] bg-[#e9f0db] p-3 rounded-md">{recordingText}</p>
                        </div>
                      ) : (
                        <p className="mb-4 text-sm text-[#5a7302]">
                          Record your question or describe your farming issue
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={startRecording}
                        className="border-[#5a7302] text-[#5a7302] hover:bg-[#e9f0db] hover:text-[#2c5f2d]"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="w-full bg-[#2c5f2d] hover:bg-[#1e3f1f] text-white"
              disabled={
                isSubmitting || (activeTab === "text" && !textInput && !recordingText && selectedImages.length === 0)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask for Advice
                </>
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

