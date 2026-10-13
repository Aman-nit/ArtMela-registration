import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { BrandHeader } from "../components/brand-header";

type AdminPageProps = { searchParams: Promise<{ search?: string; page?: string }> };
const pageSize = 25;

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
  if (!profile || profile.role !== "ADMIN") redirect("/volunteer");

  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString();
  let participantQuery = supabase.from("participants").select("id, serial_number, name, address, guardian_name, volunteer_name, contact_number, age, gender, registered_by, created_at", { count: "exact" }).order("serial_number", { ascending: false });
  const searchTerms = search.split(/\s+/).map((term) => term.replace(/[%,_()]/g, "")).filter(Boolean);
  for (const term of searchTerms) {
    const numericSearch = /^\d+$/.test(term) ? term : "";
    const numericFields = numericSearch ? `,serial_number.eq.${numericSearch},age.eq.${numericSearch}` : "";
    participantQuery = participantQuery.or(`name.ilike.%${term}%,guardian_name.ilike.%${term}%,volunteer_name.ilike.%${term}%,contact_number.ilike.%${term}%,address.ilike.%${term}%,gender.ilike.%${term}%${numericFields}`);
  }

  const from = (page - 1) * pageSize;
  const { data: participants, count, error } = await participantQuery.range(from, from + pageSize - 1);
  if (error) throw new Error("Unable to load participants");
  const [{ count: todayCount }, { data: latest }, { count: totalCount }] = await Promise.all([
    supabase.from("participants").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("participants").select("serial_number").order("serial_number", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("participants").select("id", { count: "exact", head: true }),
  ]);

  const rows = participants ?? [];

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  const queryString = query.toString();

  return (
    <>
      <BrandHeader />
      <main className="page-shell">
      <div className="page-container space-y-6">
        <header className="space-y-4"><div><p className="eyebrow">Admin workspace</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Art Mela dashboard</h1><p className="text-sm text-slate-500">Signed in as {profile.display_name}</p></div><div className="flex w-full gap-3 sm:justify-end"><a href={`/api/admin/export${queryString ? `?${queryString}` : ""}`} className="primary-button flex h-11 flex-1 items-center justify-center text-center sm:w-36 sm:flex-none">Export</a><form action={logout} className="flex h-11 flex-1 sm:w-36 sm:flex-none"><button className="secondary-button h-full w-full">Log out</button></form></div></header>
        <section className="grid grid-cols-3 gap-2 sm:gap-4"><Stat label="Total participants" value={totalCount ?? 0} /><Stat label="Today&apos;s registrations" value={todayCount ?? 0} /><Stat label="Latest serial number" value={latest?.serial_number ?? "-"} /></section>
        <section className="surface p-4 sm:p-6">
          <div className="mb-4 hidden items-center justify-between sm:flex"><div><p className="eyebrow">Participants</p><p className="mt-1 text-sm text-slate-500">{count ?? 0} participants</p></div></div>
          <form className="flex flex-col gap-3 sm:flex-row" method="get"><input name="search" defaultValue={search} placeholder="Search name, serial or phone" aria-label="Search participants by serial, name, guardian, contact, address, or registered by" className="field-control mt-0 min-w-0 flex-1" /><button className="primary-button sm:min-w-28">Search</button></form>
          <div className="mt-5 sm:hidden"><div className="mb-3"><p className="eyebrow">Participants</p><p className="mt-1 text-sm text-slate-500">{count ?? 0} participants</p></div><div className="space-y-2">{rows.map((participant) => <article key={participant.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5"><div className="flex items-start gap-3"><p className="w-12 shrink-0 text-sm font-bold text-cyan-800">#{participant.serial_number}</p><div className="min-w-0 flex-1"><h2 className="truncate text-base font-bold text-slate-900">{participant.name}</h2><p className="mt-1 text-sm text-slate-500">Age {participant.age}</p><p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-700">{participant.address || "Address not provided"}</p></div><span className="pt-1 text-2xl leading-none text-slate-400" aria-hidden="true">›</span></div></article>)}</div>{!rows.length ? <p className="py-10 text-center text-slate-500">No participants found.</p> : null}</div>
          <div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Serial</th><th className="px-3 py-3">Name</th><th className="px-3 py-3">Address</th><th className="px-3 py-3">Guardian</th><th className="px-3 py-3">Contact</th><th className="px-3 py-3">Age</th><th className="px-3 py-3">Gender</th><th className="px-3 py-3">Registered by</th><th className="px-3 py-3">Registered</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((participant) => <tr key={participant.id} className="text-slate-700"><td className="px-3 py-3 font-bold text-cyan-800">#{participant.serial_number}</td><td className="px-3 py-3 font-semibold text-slate-900">{participant.name}</td><td className="px-3 py-3">{participant.address || "-"}</td><td className="px-3 py-3">{participant.guardian_name || "-"}</td><td className="px-3 py-3">{participant.contact_number}</td><td className="px-3 py-3">{participant.age}</td><td className="px-3 py-3">{participant.gender}</td><td className="px-3 py-3">{participant.volunteer_name || "-"}</td><td className="whitespace-nowrap px-3 py-3">{new Date(participant.created_at).toLocaleString("en-IN")}</td></tr>)}</tbody></table>{!rows.length ? <p className="py-10 text-center text-slate-500">No participants found.</p> : null}</div>
          <nav className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm" aria-label="Pagination">{page > 1 ? <Link href={`/admin?${queryString}${queryString ? "&" : ""}page=${page - 1}`} className="font-semibold text-cyan-700">Previous</Link> : <span className="text-slate-400">Previous</span>}<span className="text-slate-500">Page {page} of {totalPages}</span>{page < totalPages ? <Link href={`/admin?${queryString}${queryString ? "&" : ""}page=${page + 1}`} className="font-semibold text-cyan-700">Next</Link> : <span className="text-slate-400">Next</span>}</nav>
        </section>
      </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) { return <div className="surface min-w-0 p-3 sm:p-5"><p className="truncate text-[11px] leading-tight text-slate-500 sm:text-sm">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p></div>; }
