"use server";

import { createClient } from "@/lib/supabase/server";

export type RegistrationState = {
  error?: string;
  participant?: { serialNumber: number; name: string };
};

export async function registerParticipant(
  _previousState: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };

  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const guardianName = String(formData.get("guardian_name") ?? "").trim();
  const volunteerName = String(formData.get("volunteer_name") ?? "").trim();
  const contactNumber = String(formData.get("contact_number") ?? "").trim();
  const age = Number(formData.get("age"));
  const gender = String(formData.get("gender") ?? "").trim();

  if (!name || name.length > 200 || !address || address.length > 500 || !guardianName || guardianName.length > 200 || !volunteerName || volunteerName.length > 200 || !/^\d{10}$/.test(contactNumber)) {
    return { error: "Enter valid participant, address, guardian, volunteer, and contact details." };
  }
  if (!Number.isInteger(age) || age < 3 || age > 100 || !gender) {
    return { error: "Enter a valid age and gender." };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();
  if (!profile?.is_active || !["ADMIN", "VOLUNTEER"].includes(profile.role)) {
    return { error: "You are not authorized to register participants." };
  }

  const { data: participant, error: insertError } = await supabase
    .from("participants")
    .insert({
      name,
      address,
      guardian_name: guardianName,
      volunteer_name: volunteerName,
      contact_number: contactNumber,
      age,
      gender,
      registered_by: user.id,
    })
    .select("serial_number, name")
    .single();

  if (insertError || !participant) {
    return { error: "Registration failed. No registration number was assigned." };
  }

  return {
    participant: {
      serialNumber: Number(participant.serial_number),
      name: participant.name,
    },
  };
}
