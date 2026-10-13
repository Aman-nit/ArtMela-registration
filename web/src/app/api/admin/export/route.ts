import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") ?? "").trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let query = supabase.from("participants").select("serial_number, name, address, guardian_name, volunteer_name, contact_number, age, gender, registered_by, created_at").order("serial_number", { ascending: true });
  const searchTerms = search.split(/\s+/).map((term) => term.replace(/[%,_()]/g, "")).filter(Boolean);
  for (const term of searchTerms) {
    const numericSearch = /^\d+$/.test(term) ? term : "";
    const numericFields = numericSearch ? `,serial_number.eq.${numericSearch},age.eq.${numericSearch}` : "";
    query = query.or(`name.ilike.%${term}%,guardian_name.ilike.%${term}%,volunteer_name.ilike.%${term}%,contact_number.ilike.%${term}%,address.ilike.%${term}%,gender.ilike.%${term}%${numericFields}`);
  }
  const { data: participants, error } = await query;
  if (error) return NextResponse.json({ error: "Unable to export participants" }, { status: 500 });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Participants");
  worksheet.columns = [
    { header: "Serial Number", key: "serialNumber", width: 16 },
    { header: "Name", key: "name", width: 24 },
    { header: "Address", key: "address", width: 36 },
    { header: "Guardian Name", key: "guardianName", width: 24 },
    { header: "Contact", key: "contact", width: 18 },
    { header: "Age", key: "age", width: 10 },
    { header: "Gender", key: "gender", width: 16 },
    { header: "Registered By", key: "volunteer", width: 24 },
    { header: "Registration Time", key: "registeredAt", width: 24 },
  ];
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF087F9B" } };

  for (const participant of participants ?? []) {
    worksheet.addRow({
      serialNumber: participant.serial_number,
      name: participant.name,
      address: participant.address ?? "",
      guardianName: participant.guardian_name ?? "",
      contact: participant.contact_number,
      age: participant.age,
      gender: participant.gender,
      volunteer: participant.volunteer_name ?? "",
      registeredAt: new Date(participant.created_at).toISOString(),
    });
  }

  const file = await workbook.xlsx.writeBuffer();
  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="art-mela-participants-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
