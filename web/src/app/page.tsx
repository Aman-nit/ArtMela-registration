import Link from "next/link";
import { BrandHeader } from "./components/brand-header";

export default function Home() {
  return (
    <>
      <BrandHeader />
      <main className="page-shell flex items-center">
        <section className="surface narrow-container p-6 text-center sm:p-10">
          <span className="eyebrow">Drawing competition</span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Art Mela Registration</h1>
          <p className="mt-3 text-slate-500">Choose how you want to continue.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login?role=admin"
            className="primary-button"
          >
            Admin login
          </Link>
          <Link
            href="/login?role=registration"
            className="secondary-button"
          >
            Registration login
          </Link>
          </div>
        </section>
      </main>
    </>
  );
}
