#!/usr/bin/env tsx
/**
 * Update Infernal Pulse OSZ URL to v2 (cache bypass)
 */

import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function updateInfernalPulse() {
  console.log("🔧 Updating Infernal Pulse URL...")

  const { data, error } = await supabase
    .from("songs")
    .update({ osz_url: "/infernal-pulse-v2.osz" })
    .eq("name", "Infernal Pulse")
    .eq("artist", "Suno AI")
    .select()

  if (error) {
    console.error("❌ Failed:", error.message)
    process.exit(1)
  }

  console.log("✅ Updated successfully!")
  console.log("   Updated records:", data.length)
  if (data[0]) {
    console.log("   New URL:", data[0].osz_url)
  }
}

updateInfernalPulse()
