"use client"

import { useState, useEffect } from "react"

interface BreathingModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "hi"
}

const breathingPhases = [
  { label: "Inhale", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Exhale", duration: 4 },
  { label: "Hold", duration: 4 },
]

const motivationalQuotes = {
  en: [
    "You're stronger than you think.",
    "This moment is temporary. You've overcome challenges before.",
    "Take it one breath at a time.",
    "You deserve to feel better.",
    "Progress, not perfection.",
    "Every small step counts.",
    "You are worthy of peace and calm.",
    "Breathe in possibility, breathe out doubt.",
  ],
  hi: [
    "आप जितना सोचते हैं उससे अधिक मजबूत हैं।",
    "यह पल अस्थायी है। आपने पहले भी चुनौतियों को पार किया है।",
    "एक समय में एक सांस लें।",
    "आप बेहतर महसूस करने के योग्य हैं।",
    "प्रगति, पूर्णता नहीं।",
    "हर छोटा कदम महत्वपूर्ण है।",
    "आप शांति और शांतता के योग्य हैं।",
    "संभावना में सांस लें, संदेह को बाहर निकालें।",
  ],
}

export function BreathingModal({ isOpen, onClose, language }: BreathingModalProps) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4)
  const [showQuote, setShowQuote] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState("")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setPhaseTimeLeft((prev) => {
          if (prev === 1) {
            setCurrentPhase((p) => (p + 1) % breathingPhases.length)
            return breathingPhases[(currentPhase + 1) % breathingPhases.length].duration
          }
          return prev - 1
        })
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      const quotes = motivationalQuotes[language]
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setSelectedQuote(randomQuote)
      setShowQuote(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, currentPhase, language])

  const resetExercise = () => {
    setTimeLeft(60)
    setIsActive(false)
    setCurrentPhase(0)
    setPhaseTimeLeft(4)
    setShowQuote(false)
    setSelectedQuote("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full mx-4 shadow-xl">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors">
          ✕
        </button>

        {/* Show motivational quote after exercise */}
        {showQuote ? (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold text-center">
              {language === "en" ? "Great job! 🎉" : "शानदार काम! 🎉"}
            </h2>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 border border-teal-200 dark:border-teal-700">
              <p className="text-lg text-center font-medium text-foreground italic">{selectedQuote}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-full py-3 font-medium transition-colors"
            >
              {language === "en" ? "Continue" : "जारी रखें"}
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-2xl font-semibold text-center mb-2">Box Breathing</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">(60 seconds)</p>

            {/* Timer Circle */}
            <div className="flex justify-center mb-8">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-5xl font-bold text-teal-700 dark:text-teal-300 mb-2">{phaseTimeLeft}</div>
                  <div className="text-lg font-semibold text-teal-600 dark:text-teal-200">
                    {breathingPhases[currentPhase].label}
                  </div>
                </div>

                {/* Animated Circle */}
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-400 border-r-teal-400 dark:border-t-teal-300 dark:border-r-teal-300 transition-transform"
                  style={{
                    animation: `spin ${breathingPhases[currentPhase].duration}s linear`,
                  }}
                />
              </div>
            </div>

            {/* Phase Display */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">Total time remaining</p>
              <p className="text-3xl font-semibold text-foreground">{timeLeft}s</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex-1 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-full py-2 font-medium transition-colors"
              >
                {isActive ? "Pause" : "Start"}
              </button>
              <button
                onClick={resetExercise}
                className="flex-1 border border-border rounded-full py-2 hover:bg-muted transition-colors font-medium"
              >
                Reset
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-3 rounded-full py-2 hover:bg-muted transition-colors font-medium"
            >
              Close
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  )
}
