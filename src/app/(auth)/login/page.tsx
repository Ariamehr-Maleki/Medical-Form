import Link from "next/link";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/auth";
export const metadata = { title: "Sign in" };
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Use your password or a Supabase-managed email code."
    >
      <LoginForm
        next={safeNextPath(query.next ?? null)}
        initialError={query.error}
      />
      <p className="mt-6 text-center text-sm text-slate-600">
        New to PulseVault?{" "}
        <Link href="/signup" className="font-semibold text-teal-800">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-shell">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Brand />
          <h1 className="text-navy mt-8 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
        </div>
        <section className="panel p-6 sm:p-8">{children}</section>
        <p className="mt-6 text-center text-xs text-slate-500">
          Demo only. Never enter real patient information.
        </p>
      </div>
    </main>
  );
}
