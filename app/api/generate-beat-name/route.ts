import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { originalTrackName, artistName } = await request.json()

    if (!originalTrackName) {
      return NextResponse.json({ error: "Original track name is required" }, { status: 400 })
    }

    console.log("[v0] Generating beat name for:", originalTrackName, "by", artistName)

    const prompt = `You are a creative music producer. Generate a unique beat name that is a clever homage or parody of the original track "${originalTrackName}"${artistName ? ` by ${artistName}` : ""}.

The beat name should:
- Be creative and catchy
- Reference the original but be distinct
- Be 2-5 words maximum
- Sound like a hip-hop/trap beat title
- NOT include the artist name

Examples:
- "Fly Away" → "Soar Beyond"
- "Lose Yourself" → "Find The Flow"
- "Sicko Mode" → "Beast Mode"

Generate ONLY the beat name, nothing else.`

    const { text } = await generateText({
      model: "openai/gpt-oss-120b",
      prompt,
      temperature: 0.9,
      maxTokens: 50,
    })

    const beatName = text.trim() || "Untitled Beat"

    console.log("[v0] Generated beat name:", beatName)

    return NextResponse.json({ beatName })
  } catch (error: any) {
    console.error("[v0] Error generating beat name:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack?.substring(0, 200),
    })
    return NextResponse.json(
      {
        error: "Failed to generate beat name",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
