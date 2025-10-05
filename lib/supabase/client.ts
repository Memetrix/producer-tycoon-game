import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createBrowserClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      storageKey: "producer-tycoon-auth",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  })
}

// Keep the old createClient export for backwards compatibility
export function createClient() {
  return createBrowserClient()
}
