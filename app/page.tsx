"use client"

import { useState } from "react"
import { MoodLiftChat } from "@/components/mood-lift-chat"
import { BreathingModal } from "@/components/breathing-modal"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  const [isBreathingOpen, setIsBreathingOpen] = useState(false)

  return (
    <ThemeProvider>
      <MoodLiftChat onOpenBreathing={() => setIsBreathingOpen(true)} />
      <BreathingModal isOpen={isBreathingOpen} onClose={() => setIsBreathingOpen(false)} />
    </ThemeProvider>
  )
}
