import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { SafariCompatibleStorage } from "./safari-storage"

export function createBrowserClient() {
  const storage = typeof window !== "undefined" ? new SafariCompatibleStorage() : undefined

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      storageKey: "producer-tycoon-auth",
      storage: storage as any,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

// Keep the old createClient export for backwards compatibility
export function createClient() {
  return createBrowserClient()
}
