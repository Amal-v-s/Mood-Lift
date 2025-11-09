"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

const translations = {
  en: {
    moodQuestions: [
      "I feel energetic and motivated",
      "I'm feeling calm and relaxed",
      "I'm sleeping well and feel physically healthy",
      "I have a sense of purpose today",
      "I feel connected to people around me",
    ],
    ratingLabels: {
      en: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      hi: ["बिल्कुल असहमत", "असहमत", "तटस्थ", "सहमत", "पूरी तरह सहमत"],
    },
    initialMessage:
      "Hello! I'm MoodLift. To better understand how you're feeling, I'd like to ask you to rate your agreement with a few statements.",
    placeholder: "Share your thoughts...",
    toggleTheme: "Toggle theme",
    toggleLanguage: "Select language",
    toggleTTS: "Toggle text-to-speech",
    breathing: "Start breathing exercise",
    gratitude: "Gratitude prompt",
    gratitudePrompt: "What's one small thing you're grateful for today?",
    thinking: "MoodLift is thinking…",
    disclaimer: "Friendly, safe mood support — not a medical service",
    title: "MoodLift",
    recordingRequired: "Click to start recording",
    stopRecording: "Stop recording",
    recordingError: "Recording error",
  },
  hi: {
    moodQuestions: [
      "मैं ऊर्जावान और प्रेरित महसूस कर रहा हूं",
      "मैं शांत और आराम महसूस कर रहा हूं",
      "मैं अच्छी तरह सो रहा हूं और शारीरिक रूप से स्वस्थ महसूस कर रहा हूं",
      "मुझे आज जीवन का उद्देश्य प्रतीत होता है",
      "मैं अपने चारों ओर के लोगों से जुड़ा हुआ महसूस करता हूं",
    ],
    ratingLabels: {
      en: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      hi: ["बिल्कुल असहमत", "असहमत", "तटस्थ", "सहमत", "पूरी तरह सहमत"],
    },
    initialMessage:
      "नमस्ते! मैं MoodLift हूं। आप कैसा महसूस कर रहे हैं, यह बेहतर समझने के लिए, मैं आपसे कुछ बयानों के साथ अपनी सहमति को दर करने के लिए कहना चाहूंगा।",
    placeholder: "अपने विचार साझा करें...",
    toggleTheme: "थीम बदलें",
    toggleLanguage: "भाषा चुनें",
    toggleTTS: "टेक्स्ट-टू-स्पीच बदलें",
    breathing: "साँस लेने का व्यायाम शुरू करें",
    gratitude: "कृतज्ञता संकेत",
    gratitudePrompt: "आज आप किस एक छोटी चीज़ के लिए आभारी हैं?",
    thinking: "MoodLift सोच रहा है…",
    disclaimer: "दोस्ताना, सुरक्षित मूड समर्थन — चिकित्सा सेवा नहीं",
    title: "MoodLift",
    recordingRequired: "रिकॉर्डिंग शुरू करने के लिए क्लिक करें",
    stopRecording: "रिकॉर्डिंग बंद करें",
    recordingError: "रिकॉर्डिंग त्रुटि",
  },
}

const languages = [
  { code: "en" as const, name: "English", nativeName: "English" },
  { code: "hi" as const, name: "Hindi", nativeName: "हिंदी" },
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isVisible?: boolean
}

interface MoodAnalysis {
  rating: number // 1-10 scale
  category: string // Low, Moderate, Good, Excellent
  insights: string[]
}

const analyzeMood = (ratings: number[], language: "en" | "hi"): MoodAnalysis => {
  const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

  // Convert 1-5 scale to 1-10 scale for consistency
  const score = (averageRating / 5) * 10

  // Determine category and insights based on average rating
  let category = ""
  const insights: string[] = []

  if (averageRating <= 1.5) {
    category = language === "en" ? "Low" : "कम"
    insights.push(language === "en" ? "You seem to be struggling right now" : "आप अभी संघर्ष कर रहे हैं")
  } else if (averageRating <= 2.5) {
    category = language === "en" ? "Moderate" : "मध्यम"
    insights.push(language === "en" ? "You're having a challenging time" : "आप कठिन समय से गुजर रहे हैं")
  } else if (averageRating <= 3.5) {
    category = language === "en" ? "Good" : "अच्छा"
    insights.push(language === "en" ? "You're managing well" : "आप अच्छे से संभाल रहे हैं")
  } else if (averageRating <= 4.5) {
    category = language === "en" ? "Very Good" : "बहुत अच्छा"
    insights.push(language === "en" ? "You're in a great place" : "आप बहुत अच्छी जगह पर हैं")
  } else {
    category = language === "en" ? "Excellent" : "उत्कृष्ट"
    insights.push(language === "en" ? "You're feeling amazing!" : "आप शानदार महसूस कर रहे हैं!")
  }

  return {
    rating: Math.round(score * 10) / 10,
    category,
    insights,
  }
}

export function MoodLiftChat({ onOpenBreathing }: { onOpenBreathing: (language: "en" | "hi") => void }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [moodAnswers, setMoodAnswers] = useState<number[]>([])
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [isTTSEnabled, setIsTTSEnabled] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showRecordingMenu, setShowRecordingMenu] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content: translations[language].initialMessage,
      isVisible: true,
    },
  ])
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysis | null>(null)
  const [askingAboutBreathing, setAskingAboutBreathing] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const recordingMenuRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const t = translations[language]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const sendToAPI = async (message: string) => {
    const responses = {
      en: [
        "I hear you. It's important to acknowledge how you're feeling right now.",
        "Thank you for sharing that with me. Take your time with whatever you're experiencing.",
        "That sounds like a lot to handle. Remember to be kind to yourself.",
        "I appreciate you opening up. You're doing great by reaching out.",
      ],
      hi: [
        "मैं आपकी बात सुन रहा हूं। अभी आप जैसा महसूस कर रहे हैं उसे स्वीकार करना महत्वपूर्ण है।",
        "मेरे साथ यह साझा करने के लिए धन्यवाद। अपने समय के साथ जो कुछ भी आप अनुभव कर रहे हैं उसे लेते हैं।",
        "यह संभालने के लिए बहुत कुछ लगता है। याद रखें कि अपने आप के लिए दयालु रहें।",
        "मैं आपकी खुलेपन की सराहना करता हूं। आप बहुत अच्छा कर रहे हैं।",
      ],
    }

    const langResponses = responses[language]
    return langResponses[Math.floor(Math.random() * langResponses.length)]
  }

  const addMessageWithAnimation = (message: Message) => {
    const animatedMessage = { ...message, isVisible: false }
    setMessages((prev) => [...prev, animatedMessage])

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, isVisible: true } : m)))
    }, 50)
  }

  const handleMoodAssessment = (rating: number) => {
    const updatedAnswers = [...moodAnswers, rating]
    setMoodAnswers(updatedAnswers)

    const ratingLabels = translations[language].ratingLabels[language] || {
      en: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      hi: ["बिल्कुल असहमत", "असहमत", "तटस्थ", "सहमत", "पूरी तरह सहमत"],
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `${ratingLabels[rating - 1]} (${rating}/5)`,
      isVisible: true,
    }
    setMessages((prev) => [...prev, userMessage])

    if (currentQuestionIndex < 4) {
      const nextQuestion = translations[language].moodQuestions[currentQuestionIndex + 1]

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: nextQuestion,
          isVisible: false,
        }
        addMessageWithAnimation(assistantMessage)
        setCurrentQuestionIndex((prev) => prev + 1)

        if (isTTSEnabled) {
          const utterance = new SpeechSynthesisUtterance(nextQuestion)
          utterance.lang = language === "hi" ? "hi-IN" : "en-US"
          window.speechSynthesis.speak(utterance)
        }
      }, 800)
    } else {
      setAssessmentComplete(true)

      const analysis = analyzeMood(updatedAnswers, language)
      setMoodAnalysis(analysis)

      setTimeout(() => {
        const moodRatingText =
          language === "en"
            ? `Based on your responses, I'd rate your mood as **${analysis.rating}/10** - ${analysis.category}`
            : `आपके उत्तरों के आधार पर, मैं आपकी मनोदशा को **${analysis.rating}/10** - ${analysis.category} के रूप में दर्जा देता हूँ`

        let completionText =
          moodRatingText +
          "\n\n" +
          (language === "en"
            ? "Feel free to talk about anything on your mind now!"
            : "अब बेझिझक अपने मन की किसी भी बात के बारे में बात करें!")

        completionText +=
          "\n\n" +
          (language === "en"
            ? "Would you like to try our breathing exercise?"
            : "क्या आप हमारे साँस लेने के व्यायाम को आजमाना चाहेंगे?")

        const completionMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: completionText,
          isVisible: false,
        }
        addMessageWithAnimation(completionMessage)

        if (isTTSEnabled) {
          const utterance = new SpeechSynthesisUtterance(completionMessage.content)
          utterance.lang = language === "hi" ? "hi-IN" : "en-US"
          window.speechSynthesis.speak(utterance)
        }

        setAskingAboutBreathing(true)
      }, 800)
    }
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (!assessmentComplete) {
      handleMoodAssessment(Number.parseInt(input, 10))
    } else {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
        isVisible: true,
      }

      if (isTTSEnabled) {
        const utterance = new SpeechSynthesisUtterance(input)
        utterance.lang = language === "hi" ? "hi-IN" : "en-US"
        window.speechSynthesis.speak(utterance)
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsLoading(true)

      setTimeout(async () => {
        const reply = await sendToAPI(input)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          isVisible: false,
        }

        addMessageWithAnimation(assistantMessage)
        setIsLoading(false)

        if (isTTSEnabled) {
          const utterance2 = new SpeechSynthesisUtterance(reply)
          utterance2.lang = language === "hi" ? "hi-IN" : "en-US"
          window.speechSynthesis.speak(utterance2)
        }
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) {
        const submitEvent = new Event("submit", { bubbles: true, cancelable: true })
        form.dispatchEvent(submitEvent as any)
      }
    }
  }

  const handleLanguageSelect = (langCode: "en" | "hi") => {
    setLanguage(langCode)
    setIsLanguageOpen(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await transcribeAudio(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
        setShowRecordingMenu(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Recording error:", error)
      alert(t.recordingError)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("language", language)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.error("Transcription failed")
        return
      }

      const { transcription } = await response.json()

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcription,
        isVisible: true,
      }

      if (isTTSEnabled) {
        const utterance = new SpeechSynthesisUtterance(transcription)
        utterance.lang = language === "hi" ? "hi-IN" : "en-US"
        window.speechSynthesis.speak(utterance)
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      const reply = await sendToAPI(transcription)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        isVisible: false,
      }

      addMessageWithAnimation(assistantMessage)
      setIsLoading(false)

      if (isTTSEnabled) {
        const utterance2 = new SpeechSynthesisUtterance(reply)
        utterance2.lang = language === "hi" ? "hi-IN" : "en-US"
        window.speechSynthesis.speak(utterance2)
      }
    } catch (error) {
      console.error("Transcription error:", error)
      alert("Failed to transcribe audio")
      setIsLoading(false)
    }
  }

  const handleBreathingResponse = (response: "yes" | "no") => {
    const responseText =
      response === "yes"
        ? language === "en"
          ? "Yes, let's do it!"
          : "हां, चलिए करते हैं!"
        : language === "en"
          ? "No, I'm okay for now"
          : "नहीं, मैं अभी ठीक हूं"

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: responseText,
      isVisible: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setAskingAboutBreathing(false)

    if (response === "yes") {
      setTimeout(() => {
        onOpenBreathing(language)
      }, 500)
    } else {
      setTimeout(() => {
        const continueMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            language === "en"
              ? "No problem! Feel free to chat with me anytime you need support."
              : "कोई बात नहीं! जब भी आपको समर्थन की आवश्यकता हो, बेझिझक मेरे साथ बात करें।",
          isVisible: false,
        }
        addMessageWithAnimation(continueMessage)
      }, 800)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
      if (recordingMenuRef.current && !recordingMenuRef.current.contains(event.target as Node)) {
        setShowRecordingMenu(false)
      }
    }

    if (isLanguageOpen || showRecordingMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isLanguageOpen, showRecordingMenu])

  useEffect(() => {
    const firstQuestion = translations[language].moodQuestions[0]
    const questionMessage: Message = {
      id: "question-0",
      role: "assistant",
      content: firstQuestion,
      isVisible: true, // Set to true immediately to show the question
    }

    setTimeout(() => {
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: translations[language].initialMessage,
          isVisible: true,
        },
        questionMessage,
      ])
    }, 800) // Add delay before showing first question

    if (isTTSEnabled) {
      const utterance = new SpeechSynthesisUtterance(firstQuestion)
      utterance.lang = language === "hi" ? "hi-IN" : "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }, [language, isTTSEnabled])

  return (
    <div
      className={`flex flex-col h-screen bg-background text-foreground transition-colors duration-300 ${theme === "dark" ? "dark" : ""}`}
    >
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 dark:from-amber-400 dark:to-amber-500 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
              <span className="text-2xl">☀️</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-balance">{t.title}</h1>
              <p className="text-xs text-muted-foreground">{t.disclaimer}</p>
            </div>
          </div>

          {/* Utility Controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="rounded-full w-9 h-9 p-0 hover:bg-muted hover:scale-110 transition-all duration-300"
              title={t.toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Language Dropdown */}
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="rounded-full w-9 h-9 p-0 flex items-center justify-center hover:bg-muted hover:scale-110 transition-all duration-300"
                title={t.toggleLanguage}
              >
                🌐
              </button>

              {/* Language dropdown menu */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 origin-left ${
                          language === lang.code
                            ? "bg-teal-500 text-white dark:bg-teal-600"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <div className="font-medium">{lang.name}</div>
                        <div className="text-xs text-muted-foreground">{lang.nativeName}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recording Button */}
            <div className="relative" ref={recordingMenuRef}>
              <button
                onClick={() => setShowRecordingMenu(!showRecordingMenu)}
                className={`rounded-full w-9 h-9 p-0 text-lg flex items-center justify-center hover:bg-muted hover:scale-110 transition-all duration-300 ${isRecording ? "bg-red-500/20 animate-pulse" : ""}`}
                title="Voice input"
              >
                {isRecording ? "🎙️" : "🎤"}
              </button>

              {/* Recording dropdown menu */}
              {showRecordingMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 space-y-2">
                    {!isRecording ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">{t.recordingRequired}</p>
                        <button
                          onClick={startRecording}
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                        >
                          🎤 Start Recording
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-red-500 font-medium">Recording...</p>
                        <button
                          onClick={stopRecording}
                          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-3 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 animate-pulse"
                        >
                          {t.stopRecording}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Breathing Exercise Button */}
            <button
              onClick={() => onOpenBreathing(language)}
              className="rounded-full w-9 h-9 p-0 bg-transparent text-lg hover:bg-muted hover:scale-110 transition-all duration-300 flex items-center justify-center"
              title={t.breathing}
            >
              🌬️
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-background/95 px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} transition-opacity duration-500 ${message.isVisible ? "opacity-100" : "opacity-0"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl hover:shadow-md transition-all duration-300 ${
                  message.role === "user"
                    ? "bg-teal-500 dark:bg-teal-600 text-white rounded-br-none hover:scale-105 origin-bottom-right"
                    : "bg-card border border-border text-foreground rounded-bl-none hover:scale-105 origin-bottom-left hover:border-teal-300 dark:hover:border-teal-500"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-card border border-border text-foreground rounded-2xl rounded-bl-none px-4 py-3">
                <p className="text-sm">{t.thinking}</p>
              </div>
            </div>
          )}

          {!assessmentComplete && currentQuestionIndex < 5 && !isLoading && !askingAboutBreathing && (
            <div className="flex gap-2 justify-start mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleMoodAssessment(rating)}
                  className="w-10 h-10 rounded-lg border-2 border-teal-500 hover:bg-teal-500 hover:text-white text-teal-600 dark:text-teal-400 dark:border-teal-500 dark:hover:bg-teal-600 dark:hover:text-white transition-all duration-200 font-medium hover:scale-110 active:scale-95 hover:shadow-lg"
                >
                  {rating}
                </button>
              ))}
            </div>
          )}

          {/* Yes/No buttons for breathing exercise prompt */}
          {askingAboutBreathing && (
            <div className="flex gap-2 justify-start mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleBreathingResponse("yes")}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {language === "en" ? "Yes" : "हां"}
              </button>
              <button
                onClick={() => handleBreathingResponse("no")}
                className="px-4 py-2 rounded-lg border-2 border-teal-500 text-teal-600 dark:text-teal-400 dark:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {language === "en" ? "No" : "नहीं"}
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-6 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          {assessmentComplete ? (
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-teal-500 transition-all duration-300 focus:shadow-lg focus:scale-105 origin-left disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
              >
                ➤
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-muted-foreground">{t.placeholder}</p>
          )}
        </div>
      </div>
    </div>
  )
}
