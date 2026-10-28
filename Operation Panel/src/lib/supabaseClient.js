import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const isConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseUrl.includes("your-project-id") &&
  supabaseAnonKey !== "your-supabase-anon-key";

if (!isConfigured) {
  console.warn(
    "Supabase credentials missing or set to placeholder values. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or deployment settings.",
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
