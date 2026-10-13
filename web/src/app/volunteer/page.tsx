import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RegistrationForm } from "./registration-form";
import { BrandHeader } from "../components/brand-header";

export default async function VolunteerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || !["ADMIN", "VOLUNTEER"].includes(profile.role)) redirect("/login?error=invalid");
  if (profile.role === "ADMIN") redirect("/admin");

  return (
    <>
      <BrandHeader />
      <main className="page-shell">
      <div className="narrow-container">
        <RegistrationForm />
      </div>
      </main>
    </>
  );
}
