import { z } from "zod";

export const GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
] as const;
export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export const CONDITIONS = [
  "Arthritis",
  "Asthma",
  "Cancer",
  "Diabetes",
  "Hypertension",
  "Obesity",
  "Other",
] as const;
export const INSURERS = [
  "Aetna",
  "Blue Cross",
  "Cigna",
  "Medicare",
  "UnitedHealthcare",
  "Self-pay",
  "Other",
] as const;

const cleanText = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

function validCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ageSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() !== "" ? Number(value) : value,
  z
    .number({ error: "Age is required" })
    .int("Age must be a whole number")
    .min(0)
    .max(120),
);

const billingSchema = z.preprocess(
  (value) => (typeof value === "number" ? String(value) : value),
  z
    .string()
    .trim()
    .min(1, "Billing amount is required")
    .regex(
      /^\d+(?:\.\d{1,2})?$/,
      "Use a valid amount with at most two decimal places",
    )
    .refine(
      (value) =>
        (() => {
          if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return true;
          const [whole, fraction = ""] = value.split(".");
          return (
            BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")) <=
            1_000_000_000n
          );
        })(),
      "Billing amount cannot exceed 10,000,000",
    ),
);

export const medicalRecordInputSchema = z
  .object({
    name: cleanText(2, 100, "Name").regex(
      /^[\p{L}\p{M} .'-]+$/u,
      "Use letters, spaces, apostrophes, periods, or hyphens",
    ),
    age: ageSchema,
    gender: z.enum(GENDERS),
    bloodType: z.enum(BLOOD_TYPES),
    medicalCondition: z.enum(CONDITIONS),
    customCondition: z.string().trim().max(100).optional().default(""),
    admissionDate: z
      .string()
      .refine(validCalendarDate, "Enter a valid calendar date")
      .refine(
        (value) => value <= todayString(),
        "Admission date cannot be in the future",
      ),
    doctor: cleanText(2, 100, "Doctor"),
    hospital: cleanText(2, 150, "Hospital"),
    insuranceProvider: z.enum(INSURERS),
    customInsuranceProvider: z.string().trim().max(100).optional().default(""),
    billingAmount: billingSchema,
    idempotencyKey: z.string().uuid().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.medicalCondition === "Other" &&
      value.customCondition.length < 2
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["customCondition"],
        message: "Describe the medical condition",
      });
    }
    if (
      value.insuranceProvider === "Other" &&
      value.customInsuranceProvider.length < 2
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["customInsuranceProvider"],
        message: "Enter the insurance provider",
      });
    }
  });

export type MedicalRecordInput = z.input<typeof medicalRecordInputSchema>;
export type ValidMedicalRecordInput = z.output<typeof medicalRecordInputSchema>;

export type NormalizedMedicalRecord = {
  name: string;
  age: number;
  gender: (typeof GENDERS)[number];
  bloodType: (typeof BLOOD_TYPES)[number];
  medicalCondition: string;
  admissionDate: string;
  doctor: string;
  hospital: string;
  insuranceProvider: string;
  billingAmount: string;
};

function normalizeMoney(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return `${BigInt(whole).toString()}.${fraction.padEnd(2, "0")}`;
}

export function normalizeMedicalRecord(
  input: unknown,
): NormalizedMedicalRecord {
  const parsed = medicalRecordInputSchema.parse(input);
  return {
    name: parsed.name,
    age: parsed.age,
    gender: parsed.gender,
    bloodType: parsed.bloodType,
    medicalCondition:
      parsed.medicalCondition === "Other"
        ? parsed.customCondition
        : parsed.medicalCondition,
    admissionDate: parsed.admissionDate,
    doctor: parsed.doctor,
    hospital: parsed.hospital,
    insuranceProvider:
      parsed.insuranceProvider === "Other"
        ? parsed.customInsuranceProvider
        : parsed.insuranceProvider,
    billingAmount: normalizeMoney(parsed.billingAmount),
  };
}

export { todayString, validCalendarDate };
