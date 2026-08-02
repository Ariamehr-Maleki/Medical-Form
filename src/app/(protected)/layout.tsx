import Link from "next/link";
import { redirect } from "next/navigation";
import { FilePlus2, Files, LayoutDashboard, LogOut } from "lucide-react";
import { Brand } from "@/components/brand";
import { logout } from "@/app/auth-actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    redirect("/login?error=configuration");
  }
  if (!user) redirect("/login");
  if (!user.email_confirmed_at) redirect("/login?error=unverified");
  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="app-container flex min-h-16 items-center justify-between gap-4">
          <Brand />
          <nav className="flex items-center gap-1" aria-label="Application">
            <Nav
              href="/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard />}
            />
            <Nav href="/records" label="Records" icon={<Files />} />
            <Nav href="/records/new" label="New" icon={<FilePlus2 />} />
            <form action={logout}>
              <button
                className="ml-2 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        PulseVault is a demonstration and must not be used for clinical
        decisions.
      </footer>
    </div>
  );
}
function Nav({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactElement;
}) {
  return (
    <Link
      href={href}
      className="hover:text-navy inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
    >
      {<span className="size-4">{icon}</span>}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
