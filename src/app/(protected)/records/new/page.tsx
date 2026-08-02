import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MedicalRecordForm } from "@/components/medical-records/record-form";
export const metadata = { title: "New medical record" };
export default function NewRecordPage() {
  return (
    <main className="app-container py-10">
      <Link
        href="/dashboard"
        className="hover:text-navy mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"
      >
        <ArrowLeft className="size-4" /> Dashboard
      </Link>
      <div className="mb-8">
        <p className="eyebrow">Validated intake</p>
        <h1 className="text-navy mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Create a medical record
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Enter fictional demonstration data. Every value is validated again on
          the server before storage.
        </p>
      </div>
      <MedicalRecordForm />
    </main>
  );
}
