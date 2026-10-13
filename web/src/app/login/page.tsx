import { login } from "./actions";
import { BrandHeader } from "../components/brand-header";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; role?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, role } = await searchParams;
  const isAdminLogin = role === "admin";
  const isRegistrationLogin = role === "registration";
  const title = isAdminLogin ? "Admin login" : isRegistrationLogin ? "Registration login" : "Sign in";

  return (
    <>
      <BrandHeader />
      <main className="page-shell flex items-center">
      <section className="surface narrow-container p-6 sm:p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow">Secure access</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Art Mela Registration</h1>
          <p className="mt-2 text-sm text-slate-500">{title}</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error === "not_configured" ? "This account is not configured for the event." : "The email or password is incorrect."}
          </p>
        ) : null}

        <form action={login} className="space-y-4">
          <input type="hidden" name="role" value={role ?? ""} />
          <label className="field-label">
            Email or username
            <input
              name="username"
              required
              // placeholder="aman.nit.cse@gmail.com"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="field-control"
            />
          </label>
          <label className="field-label">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field-control"
            />
          </label>
          <button
            type="submit"
            className="primary-button w-full"
          >
            {title}
          </button>
        </form>
      </section>
      </main>
    </>
  );
}
