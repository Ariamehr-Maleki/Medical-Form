import Papa from "papaparse";
import type { NormalizedMedicalRecord } from "./schema";

export const CSV_HEADERS = [
  "Name",
  "Age",
  "Gender",
  "Blood Type",
  "Medical Condition",
  "Date of Admission",
  "Doctor",
  "Hospital",
  "Insurance Provider",
  "Billing Amount",
] as const;

export function recordToCsvRow(record: NormalizedMedicalRecord) {
  return [
    record.name,
    String(record.age),
    record.gender,
    record.bloodType,
    record.medicalCondition,
    record.admissionDate,
    record.doctor,
    record.hospital,
    record.insuranceProvider,
    record.billingAmount,
  ];
}

export function serializeMedicalRecord(record: NormalizedMedicalRecord) {
  return (
    Papa.unparse(
      { fields: [...CSV_HEADERS], data: [recordToCsvRow(record)] },
      { newline: "\r\n", quotes: false },
    ) + "\r\n"
  );
}

export function parseMedicalCsv(csv: string) {
  return Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
}

export function safeCsvFilename(date: string, id: string) {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "record";
  const shortId = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "download";
  return `medical-record-${safeDate}-${shortId}.csv`;
}
