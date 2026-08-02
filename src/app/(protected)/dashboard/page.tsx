import Link from "next/link";
import { CalendarClock, Database, FilePlus2, Files } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  formatMoney,
  formatTimestamp,
  readNormalized,
} from "@/lib/medical-records/display";
export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ count }, { data }] = await Promise.all([
    supabase
      .from("medical_submissions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("medical_submissions")
      .select("id, normalized_data, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const recent = data ?? [];
  const emailName =
    user?.email
      ?.split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "there";
  return (
    <main className="app-container py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Private workspace</p>
          <h1 className="text-navy mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Good to see you, {emailName}
          </h1>
          <p className="mt-2 text-slate-600">
            Your validated submissions, protected by your authenticated session.
          </p>
        </div>
        <Link href="/records/new" className="btn-primary">
          <FilePlus2 className="size-4" /> New medical record
        </Link>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Files />}
          label="Total submissions"
          value={String(count ?? 0)}
        />
        <Stat
          icon={<CalendarClock />}
          label="Most recent"
          value={
            recent[0]
              ? formatTimestamp(recent[0].created_at)
              : "No submissions yet"
          }
        />
        <Stat icon={<Database />} label="Current schema" value="Version 1" />
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-navy text-xl font-semibold">
            Recent submissions
          </h2>
          {recent.length > 0 && (
            <Link
              href="/records"
              className="text-sm font-semibold text-teal-800"
            >
              View all records
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="panel py-12 text-center">
            <span className="icon-box mx-auto">
              <FilePlus2 className="size-5" />
            </span>
            <h3 className="text-navy mt-5 text-lg font-semibold">
              Your vault is ready
            </h3>
            <p className="mt-2 text-slate-600">
              Create a fictional admission record to see validation and
              canonical CSV storage in action.
            </p>
            <Link href="/records/new" className="btn-primary mt-6">
              Create first record
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {recent.map((row) => {
                const record = readNormalized(row.normalized_data);
                return (
                  record && (
                    <Link
                      key={row.id}
                      href={`/records/${row.id}`}
                      className="panel block p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-navy font-semibold">
                          {record.name}
                        </h3>
                        <span className="text-sm font-semibold text-teal-800">
                          View
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {record.medicalCondition} / {record.admissionDate}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {record.hospital} / {formatMoney(record.billingAmount)}
                      </p>
                    </Link>
                  )
                );
              })}
            </div>
            <div className="table-wrap hidden md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Admission</th>
                    <th>Condition</th>
                    <th>Hospital</th>
                    <th>Billing</th>
                    <th>
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => {
                    const r = readNormalized(row.normalized_data);
                    return (
                      r && (
                        <tr key={row.id}>
                          <td className="text-navy! font-semibold!">
                            {r.name}
                          </td>
                          <td>{r.admissionDate}</td>
                          <td>{r.medicalCondition}</td>
                          <td>{r.hospital}</td>
                          <td>{formatMoney(r.billingAmount)}</td>
                          <td>
                            <Link
                              href={`/records/${row.id}`}
                              className="font-semibold text-teal-800"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="panel flex items-start gap-4">
      <span className="icon-box [&_svg]:size-5">{icon}</span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-navy mt-1 font-semibold">{value}</p>
      </div>
    </article>
  );
}
