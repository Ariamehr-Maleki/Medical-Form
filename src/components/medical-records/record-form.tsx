"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  LoaderCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  BLOOD_TYPES,
  CONDITIONS,
  GENDERS,
  INSURERS,
  medicalRecordInputSchema,
  normalizeMedicalRecord,
  todayString,
  type MedicalRecordInput,
  type ValidMedicalRecordInput,
} from "@/lib/medical-records/schema";
import { serializeMedicalRecord } from "@/lib/medical-records/csv";
import { Button, Field, Input, Select } from "@/components/ui/forms";

type Created = { id: string; created_at: string };
export function MedicalRecordForm() {
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const form = useForm<MedicalRecordInput, unknown, ValidMedicalRecordInput>({
    resolver: zodResolver(medicalRecordInputSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      age: "",
      gender: "Prefer not to say",
      bloodType: "O+",
      medicalCondition: "Asthma",
      customCondition: "",
      admissionDate: todayString(),
      doctor: "",
      hospital: "",
      insuranceProvider: "Self-pay",
      customInsuranceProvider: "",
      billingAmount: "",
      idempotencyKey: crypto.randomUUID(),
    },
  });
  const values = useWatch({ control: form.control });
  const condition = values.medicalCondition;
  const insurer = values.insuranceProvider;
  const csvPreview = useMemo(() => {
    try {
      return serializeMedicalRecord(normalizeMedicalRecord(values));
    } catch {
      return "Complete the required fields to generate the canonical CSV preview.";
    }
  }, [values]);
  async function moveToReview() {
    const valid = await form.trigger();
    if (valid) {
      setReviewing(true);
      setServerError("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  async function submit(data: ValidMedicalRecordInput) {
    setSaving(true);
    setServerError("");
    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: unknown = await response.json();
      if (
        typeof result === "object" &&
        result &&
        "ok" in result &&
        result.ok === true &&
        "data" in result
      )
        setCreated((result as { data: Created }).data);
      else {
        const message =
          typeof result === "object" && result && "error" in result
            ? (result as { error?: { message?: string } }).error?.message
            : undefined;
        setServerError(message || "The record could not be saved.");
      }
    } catch {
      setServerError(
        "The network request failed. Your data was not saved; try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (created)
    return (
      <section
        className="panel mx-auto max-w-2xl p-8 text-center"
        role="status"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-8" />
        </span>
        <h2 className="text-navy mt-6 text-3xl font-bold">
          Record stored exactly as reviewed
        </h2>
        <p className="mt-3 text-slate-600">
          The validated CSV and its SHA-256 checksum are now protected by your
          user-scoped vault.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="btn-primary"
            href={`/api/records/${created.id}/download`}
          >
            <Download className="size-4" /> Download CSV
          </Link>
          <Link className="btn-secondary" href={`/records/${created.id}`}>
            View details
          </Link>
          <button
            className="btn-secondary"
            onClick={() => {
              form.reset({
                ...form.getValues(),
                name: "",
                idempotencyKey: crypto.randomUUID(),
              });
              setCreated(null);
              setReviewing(false);
            }}
          >
            <RotateCcw className="size-4" /> Add another
          </button>
        </div>
      </section>
    );
  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span
            className={`grid size-7 place-items-center rounded-full ${!reviewing ? "bg-teal-700 text-white" : "bg-emerald-100 text-emerald-800"}`}
          >
            1
          </span>
          <span>Record details</span>
          <span className="mx-1 h-px w-8 bg-slate-300" />
          <span
            className={`grid size-7 place-items-center rounded-full ${reviewing ? "bg-teal-700 text-white" : "bg-slate-200"}`}
          >
            2
          </span>
          <span>Review</span>
        </div>
        <span className="text-xs text-slate-500">Schema v1</span>
      </div>
      {serverError && (
        <div
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <strong>Nothing was saved.</strong> {serverError}
        </div>
      )}
      {!reviewing ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-6">
            <Section
              title="Patient identity"
              copy="Only the fields needed by the interview dataset."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Name"
                  required
                  error={form.formState.errors.name?.message}
                >
                  <Input
                    autoComplete="name"
                    {...form.register("name")}
                    aria-invalid={Boolean(form.formState.errors.name)}
                  />
                </Field>
                <Field
                  label="Age"
                  required
                  error={form.formState.errors.age?.message?.toString()}
                >
                  <Input
                    type="number"
                    min="0"
                    max="120"
                    inputMode="numeric"
                    {...form.register("age")}
                  />
                </Field>
                <Field
                  label="Gender"
                  required
                  error={form.formState.errors.gender?.message}
                >
                  <Select {...form.register("gender")}>
                    {GENDERS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Blood type"
                  required
                  error={form.formState.errors.bloodType?.message}
                >
                  <Select {...form.register("bloodType")}>
                    {BLOOD_TYPES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Section>
            <Section
              title="Clinical details"
              copy="Use the fixed dataset categories; choose Other when needed."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Medical condition"
                  required
                  error={form.formState.errors.medicalCondition?.message}
                >
                  <Select {...form.register("medicalCondition")}>
                    {CONDITIONS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                {condition === "Other" && (
                  <Field
                    label="Custom condition"
                    required
                    error={form.formState.errors.customCondition?.message}
                  >
                    <Input {...form.register("customCondition")} />
                  </Field>
                )}
              </div>
            </Section>
            <Section title="Admission information">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Date of admission"
                  required
                  error={form.formState.errors.admissionDate?.message}
                >
                  <Input
                    type="date"
                    max={todayString()}
                    {...form.register("admissionDate")}
                  />
                </Field>
                <Field
                  label="Doctor"
                  required
                  error={form.formState.errors.doctor?.message}
                >
                  <Input
                    autoComplete="off"
                    placeholder="Dr. Maya Chen"
                    {...form.register("doctor")}
                  />
                </Field>
                <Field
                  label="Hospital"
                  required
                  error={form.formState.errors.hospital?.message}
                >
                  <Input
                    autoComplete="organization"
                    placeholder="Northstar Medical Center"
                    {...form.register("hospital")}
                  />
                </Field>
              </div>
            </Section>
            <Section title="Billing and insurance">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Insurance provider"
                  required
                  error={form.formState.errors.insuranceProvider?.message}
                >
                  <Select {...form.register("insuranceProvider")}>
                    {INSURERS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                {insurer === "Other" && (
                  <Field
                    label="Custom provider"
                    required
                    error={
                      form.formState.errors.customInsuranceProvider?.message
                    }
                  >
                    <Input {...form.register("customInsuranceProvider")} />
                  </Field>
                )}
                <Field
                  label="Billing amount"
                  required
                  hint="USD, maximum two decimal places."
                  error={form.formState.errors.billingAmount?.message?.toString()}
                >
                  <Input
                    inputMode="decimal"
                    placeholder="1845.75"
                    {...form.register("billingAmount")}
                  />
                </Field>
              </div>
            </Section>
            <div className="flex justify-end">
              <Button type="button" onClick={() => void moveToReview()}>
                Review record <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="panel">
              <p className="eyebrow">Live output</p>
              <h2 className="text-navy mt-2 text-lg font-semibold">
                Canonical CSV preview
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Updates after the current values satisfy every rule.
              </p>
              <pre className="code-preview mt-5 max-h-72">{csvPreview}</pre>
            </div>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Section
            title="Final review"
            copy="This exact normalized row will be stored. Return to edit if anything is incorrect."
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {Object.entries(normalizeMedicalRecord(form.getValues())).map(
                ([key, value]) => (
                  <div key={key} className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      {labelize(key)}
                    </dt>
                    <dd className="mt-1 font-medium break-words text-slate-900">
                      {String(value)}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </Section>
          <aside>
            <div className="panel">
              <p className="eyebrow">Exact stored content</p>
              <pre className="code-preview mt-4 max-h-80">{csvPreview}</pre>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Submitting confirms this is fictional demo data and not intended
                for clinical decisions.
              </p>
            </div>
          </aside>
          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setReviewing(false)}
            >
              <ArrowLeft className="size-4" /> Back to edit
            </button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? "Saving securely…" : "Save validated CSV"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
function Section({
  title,
  copy,
  children,
}: {
  title: string;
  copy?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <h2 className="text-navy text-xl font-semibold">{title}</h2>
      {copy && <p className="mt-1 text-sm text-slate-600">{copy}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}
