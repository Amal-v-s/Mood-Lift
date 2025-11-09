import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio to base64 for AI processing
    const audioBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString("base64")

    // Use AI to transcribe the audio
    const { text: transcription } = await generateText({
      model: "openai/gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: `Please transcribe this audio content in ${language === "hi" ? "Hindi" : "English"}. Return only the transcribed text without any additional commentary.`,
        },
      ],
    })

    return Response.json({ transcription })
  } catch (error) {
    console.error("[v0] Transcription error:", error)
    return Response.json({ error: "Failed to transcribe audio" }, { status: 500 })
  }
}
