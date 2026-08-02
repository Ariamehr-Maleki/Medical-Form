import type { Json } from "@/lib/supabase/database.types";
import type { NormalizedMedicalRecord } from "./schema";
export function readNormalized(value: Json): NormalizedMedicalRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, Json | undefined>;
  const strings = [
    "name",
    "gender",
    "bloodType",
    "medicalCondition",
    "admissionDate",
    "doctor",
    "hospital",
    "insuranceProvider",
    "billingAmount",
  ] as const;
  if (
    typeof v.age !== "number" ||
    strings.some((key) => typeof v[key] !== "string")
  )
    return null;
  return v as unknown as NormalizedMedicalRecord;
}
export function formatMoney(value: string) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(number)
    : value;
}
export function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
