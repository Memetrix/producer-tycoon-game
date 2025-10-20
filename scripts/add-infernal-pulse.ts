#!/usr/bin/env tsx
/**
 * Add Infernal Pulse track from Suno AI to the songs database
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials")
  console.error("Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function addInfernalPulse() {
  console.log("🎵 Adding Infernal Pulse to database...")

  try {
    // Check if song already exists
    const { data: existing } = await supabase
      .from("songs")
      .select("id, name, artist")
      .eq("name", "Infernal Pulse")
      .eq("artist", "Suno AI")
      .single()

    if (existing) {
      console.log("✅ Infernal Pulse already exists:", existing.id)
      return
    }

    // Insert the song
    const { data, error } = await supabase
      .from("songs")
      .insert({
        name: "Infernal Pulse",
        artist: "Suno AI",
        genre: "Electronic",
        osz_url: "/infernal-pulse.osz",
        file_size: 3228123, // 3.1 MB
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Failed to insert song:", error.message)
      process.exit(1)
    }

    console.log("✅ Successfully added Infernal Pulse!")
    console.log("   ID:", data.id)
    console.log("   Name:", data.name)
    console.log("   Artist:", data.artist)
    console.log("   URL:", data.osz_url)

    // Verify it's queryable
    const { data: songs, error: queryError } = await supabase
      .from("songs")
      .select("*")
      .eq("is_active", true)

    if (queryError) {
      console.error("⚠️  Warning: Failed to verify songs:", queryError.message)
    } else {
      console.log(`\n📊 Total active songs in database: ${songs.length}`)
      songs.forEach((song, i) => {
        console.log(`   ${i + 1}. ${song.name} - ${song.artist}`)
      })
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    process.exit(1)
  }
}

addInfernalPulse()
