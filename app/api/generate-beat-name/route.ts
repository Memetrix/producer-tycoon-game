import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { originalTrackName, artistName } = await request.json()

    if (!originalTrackName) {
      return NextResponse.json({ error: "Original track name is required" }, { status: 400 })
    }

    console.log("[v0] Generating beat name for:", originalTrackName, "by", artistName)
    console.log("[v0] Groq API key available:", !!process.env.GROQ_API_KEY)

    const prompt = `You are a creative music producer. Generate a unique beat name that is a clever homage or parody of the original track "${originalTrackName}"${artistName ? ` by ${artistName}` : ""}.

The beat name should:
- Be creative and catchy
- Reference the original but be distinct
- Be 2-5 words maximum
- Sound like a hip-hop/trap beat title
- NOT include the artist name
- Be DIFFERENT each time - use wordplay, slang, metaphors, or cultural references

Examples of creative transformations:
- "Fly Away" → "Soar Beyond" / "Wings Up" / "Sky Drift"
- "Lose Yourself" → "Find The Flow" / "Zone Out" / "Deep Dive"
- "Sicko Mode" → "Beast Mode" / "Savage Hours" / "Wild State"
- "Feel Good Inc." → "Vibe Syndicate" / "Good Energy Co." / "Mood Factory" / "Chill Corporation"

Be creative and unpredictable! Generate ONLY the beat name, nothing else.`

    console.log("[v0] Calling Groq API with model: llama-3.3-70b-versatile")

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 50,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Groq API error:", response.status, errorText)
      throw new Error(`Groq API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Groq API response:", JSON.stringify(data, null, 2))

    const text = data.choices?.[0]?.message?.content || ""
    console.log("[v0] Raw AI response:", text)

    const beatName = text.trim() || "Untitled Beat"

    console.log("[v0] Generated beat name:", beatName)

    return NextResponse.json({ beatName })
  } catch (error: any) {
    console.error("[v0] Error generating beat name:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      type: error.type,
      name: error.name,
      cause: error.cause,
      stack: error.stack?.substring(0, 500),
    })

    return NextResponse.json(
      {
        error: "Failed to generate beat name",
        details: error.message,
        errorType: error.name,
      },
      { status: 500 },
    )
  }
}
