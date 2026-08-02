import Link from "next/link";
import { Download, FilePlus2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  formatMoney,
  formatTimestamp,
  readNormalized,
} from "@/lib/medical-records/display";
const PAGE_SIZE = 10;
export const metadata = { title: "Submission history" };
export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const q = (params.q || "").trim().slice(0, 60);
  const supabase = await createClient();
  let query = supabase
    .from("medical_submissions")
    .select("id, normalized_data, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q)
    query = query.or(
      `normalized_data->>name.ilike.%${q.replace(/[%_,()]/g, "")}%,normalized_data->>hospital.ilike.%${q.replace(/[%_,()]/g, "")}%`,
    );
  const { data, count } = await query;
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  return (
    <main className="app-container py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Personal history</p>
          <h1 className="text-navy mt-3 text-3xl font-bold">
            Medical submissions
          </h1>
          <p className="mt-2 text-slate-600">
            Only records owned by your authenticated account are queried.
          </p>
        </div>
        <Link href="/records/new" className="btn-primary">
          <FilePlus2 className="size-4" /> New record
        </Link>
      </div>
      <form className="panel mt-8 flex gap-3 p-3" action="/records">
        <label className="relative flex-1">
          <span className="sr-only">Search by patient or hospital</span>
          <Search className="absolute top-3 left-3 size-5 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pr-3 pl-10 outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-100"
            placeholder="Search patient or hospital"
          />
        </label>
        <button className="btn-secondary">Search</button>
      </form>
      {rows.length === 0 ? (
        <div className="panel mt-6 py-12 text-center">
          <h2 className="text-navy text-lg font-semibold">
            {q ? "No matching records" : "No records yet"}
          </h2>
          <p className="mt-2 text-slate-600">
            {q
              ? "Try a different patient or hospital name."
              : "Create your first validated admission record."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 md:hidden">
            {rows.map((row) => {
              const record = readNormalized(row.normalized_data);
              return (
                record && (
                  <article key={row.id} className="panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-navy font-semibold">
                          {record.name}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted {formatTimestamp(row.created_at)}
                        </p>
                      </div>
                      <Link
                        href={`/records/${row.id}`}
                        className="text-sm font-semibold text-teal-800"
                      >
                        View
                      </Link>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500">Admission</dt>
                        <dd className="mt-1">{record.admissionDate}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Condition</dt>
                        <dd className="mt-1">{record.medicalCondition}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Hospital</dt>
                        <dd className="mt-1">{record.hospital}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Billing</dt>
                        <dd className="mt-1">
                          {formatMoney(record.billingAmount)}
                        </dd>
                      </div>
                    </dl>
                    <Link
                      href={`/api/records/${row.id}/download`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-800"
                    >
                      <Download className="size-4" /> Download CSV
                    </Link>
                  </article>
                )
              );
            })}
          </div>
          <div className="table-wrap mt-6 hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Admission</th>
                  <th>Condition</th>
                  <th>Hospital</th>
                  <th>Billing</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const r = readNormalized(row.normalized_data);
                  return (
                    r && (
                      <tr key={row.id}>
                        <td className="text-navy! font-semibold!">{r.name}</td>
                        <td>{r.admissionDate}</td>
                        <td>{r.medicalCondition}</td>
                        <td>{r.hospital}</td>
                        <td>{formatMoney(r.billingAmount)}</td>
                        <td>{formatTimestamp(row.created_at)}</td>
                        <td>
                          <div className="flex gap-3">
                            <Link
                              href={`/records/${row.id}`}
                              className="font-semibold text-teal-800"
                            >
                              View
                            </Link>
                            <Link
                              href={`/api/records/${row.id}/download`}
                              aria-label={`Download CSV for ${r.name}`}
                            >
                              <Download className="size-4 text-slate-500" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  className="btn-secondary"
                  href={`/records?page=${page - 1}&q=${encodeURIComponent(q)}`}
                >
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link
                  className="btn-secondary"
                  href={`/records?page=${page + 1}&q=${encodeURIComponent(q)}`}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
