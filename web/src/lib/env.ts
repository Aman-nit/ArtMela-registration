type PublicEnvironment = {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let cachedEnvironment: PublicEnvironment | undefined;

export function getPublicEnvironment(): PublicEnvironment {
  if (cachedEnvironment) return cachedEnvironment;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL");
  }

  cachedEnvironment = { supabaseUrl, supabaseAnonKey };
  return cachedEnvironment;
}
