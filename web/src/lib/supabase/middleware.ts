import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnvironment } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getPublicEnvironment();

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  try {
    await supabase.auth.getUser();
  } catch (error) {
    const authError = error as { code?: string };
    if (authError.code === "refresh_token_not_found") {
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith("sb-")) {
          response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
        }
      }
    } else {
      throw error;
    }
  }
  return response;
}
