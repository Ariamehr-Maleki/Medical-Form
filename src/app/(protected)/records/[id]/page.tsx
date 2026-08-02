import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatMoney,
  formatTimestamp,
  readNormalized,
} from "@/lib/medical-records/display";
export const metadata = { title: "Record details" };
export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("medical_submissions")
    .select(
      "id, schema_version, csv_content, csv_sha256, normalized_data, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const record = readNormalized(data.normalized_data);
  if (!record) notFound();
  return (
    <main className="app-container py-10">
      <Link
        href="/records"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft className="size-4" /> All records
      </Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">
            <ShieldCheck className="size-4" /> Owner-only record
          </p>
          <h1 className="text-navy mt-3 text-3xl font-bold">{record.name}</h1>
          <p className="mt-2 text-slate-600">
            Submitted {formatTimestamp(data.created_at)}
          </p>
        </div>
        <Link href={`/api/records/${data.id}/download`} className="btn-primary">
          <Download className="size-4" /> Download exact CSV
        </Link>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="panel">
          <h2 className="text-navy text-xl font-semibold">Normalized record</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            {Object.entries(record).map(([key, value]) => (
              <div key={key} className="border-b border-slate-100 pb-3">
                <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {key.replace(/([A-Z])/g, " $1")}
                </dt>
                <dd className="mt-1 font-medium break-words text-slate-900">
                  {key === "billingAmount"
                    ? formatMoney(String(value))
                    : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel">
          <div className="flex items-center justify-between">
            <h2 className="text-navy text-xl font-semibold">Stored CSV</h2>
            <span className="status-success">
              Schema v{data.schema_version}
            </span>
          </div>
          <pre className="code-preview mt-5 max-h-96">{data.csv_content}</pre>
          <div className="mt-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              SHA-256 checksum
            </p>
            <p className="mt-2 font-mono text-xs break-all text-slate-600">
              {data.csv_sha256}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
