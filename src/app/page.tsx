import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "@/components/brand";
const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified access",
    copy: "Email verification, password login, and Supabase-managed one-time codes keep access controlled.",
  },
  {
    icon: CheckCircle2,
    title: "Schema validation",
    copy: "The same strict rules run before submission and again at the trusted server boundary.",
  },
  {
    icon: FileCheck2,
    title: "Portable CSV",
    copy: "Every accepted record becomes a canonical, checksummed CSV you can preview and download.",
  },
];
export default function Home() {
  return (
    <main>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-3" aria-label="Primary">
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary hidden sm:inline-flex">
            Create account
          </Link>
        </nav>
      </header>
      <section className="hero-grid overflow-hidden border-y border-slate-200">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
          <div>
            <p className="eyebrow">
              <LockKeyhole className="size-4" /> Verified intake. Exact output.
            </p>
            <h1 className="text-navy mt-6 max-w-3xl text-5xl font-bold tracking-[-0.045em] sm:text-6xl">
              Medical data in. Trustworthy CSV out.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              PulseVault turns carefully validated admission records into
              consistent, checksummed CSV files—protected by verified access and
              user-scoped storage.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary">
                Start secure intake <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="btn-secondary">
                I have an account
              </Link>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Demonstration only. Not for clinical decisions or real patient
              information.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 -z-10 rounded-full bg-teal-100/70 blur-3xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">
                    Admission record
                  </p>
                  <p className="text-navy mt-1 font-semibold">
                    Canonical CSV preview
                  </p>
                </div>
                <span className="status-success">Validated</span>
              </div>
              <div className="grid grid-cols-2 gap-4 p-5 text-sm">
                <Preview label="Patient" value="Jordan Lee" />
                <Preview label="Admission" value="2026-07-18" />
                <Preview label="Condition" value="Asthma" />
                <Preview label="Hospital" value="Northstar Medical Center" />
              </div>
              <div className="bg-navy border-t border-slate-200 p-5 font-mono text-xs leading-6 text-cyan-50">
                <p>Name,Age,Gender,Blood Type...</p>
                <p className="text-cyan-300">
                  Jordan Lee,42,Other,O+,Asthma...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">Built for confidence</p>
          <h2 className="text-navy mt-4 text-3xl font-bold tracking-tight">
            A focused workflow, with safeguards at every boundary.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="panel">
              <span className="icon-box">
                <Icon className="size-5" />
              </span>
              <h3 className="text-navy mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Brand />
          <p>
            Fictional interview demonstration. Do not use for clinical
            decisions.
          </p>
        </div>
      </footer>
    </main>
  );
}
function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900">{value}</p>
    </div>
  );
}
