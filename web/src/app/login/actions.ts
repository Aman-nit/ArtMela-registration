"use server";

import { redirect } from "next/navigation";
import { authEmailForUsername, createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");
  const loginPath = role ? `/login?role=${encodeURIComponent(role)}` : "/login";
  const errorPath = (error: string) => `${loginPath}${loginPath.includes("?") ? "&" : "?"}error=${error}`;

  if (!username || !password) {
    redirect(errorPath("invalid"));
  }

  const supabase = await createClient();
  const email = username.includes("@") ? username.toLowerCase() : authEmailForUsername(username);
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase login failed", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    redirect(errorPath("invalid"));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", signInData.user.id)
    .single();

  if (!profile) {
    console.error("Authenticated user has no matching profile", {
      userId: signInData.user.id,
    });
  }

  const expectedRole = role === "admin" ? "ADMIN" : role === "registration" ? "VOLUNTEER" : null;
  if (!profile?.is_active || !["ADMIN", "VOLUNTEER"].includes(profile.role) || (expectedRole && profile.role !== expectedRole)) {
    await supabase.auth.signOut();
    redirect(errorPath("not_configured"));
  }

  redirect(profile.role === "ADMIN" ? "/admin" : "/volunteer");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
