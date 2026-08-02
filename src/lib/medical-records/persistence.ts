import { ZodError } from "zod";
import type { ActionResult } from "@/lib/errors";
import { sha256 } from "./checksum";
import { serializeMedicalRecord } from "./csv";
import { normalizeMedicalRecord, type NormalizedMedicalRecord } from "./schema";
export type SubmissionInsert = {
  user_id: string;
  csv_content: string;
  csv_sha256: string;
  normalized_data: NormalizedMedicalRecord;
  source: "manual";
  row_count: 1;
  schema_version: 1;
};
type InsertResult = {
  data: { id: string; created_at: string } | null;
  error: { code?: string } | null;
};
export async function persistMedicalRecord(
  input: unknown,
  userId: string | null,
  insert: (value: SubmissionInsert) => Promise<InsertResult>,
): Promise<ActionResult<{ id: string; created_at: string }>> {
  if (!userId)
    return {
      ok: false,
      error: {
        code: "AUTH_REQUIRED",
        message: "Sign in before saving a record.",
      },
    };
  try {
    const record = normalizeMedicalRecord(input);
    const csv = serializeMedicalRecord(record);
    const checksum = sha256(csv);
    const result = await insert({
      user_id: userId,
      csv_content: csv,
      csv_sha256: checksum,
      normalized_data: record,
      source: "manual",
      row_count: 1,
      schema_version: 1,
    });
    if (result.error?.code === "23505")
      return {
        ok: false,
        error: {
          code: "DUPLICATE",
          message: "An identical record is already stored in your vault.",
        },
      };
    if (result.error || !result.data)
      return {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: "The record could not be saved. Try again shortly.",
        },
      };
    return { ok: true, data: result.data };
  } catch (error) {
    if (error instanceof ZodError)
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Review the highlighted values and try again.",
          fields: error.flatten().fieldErrors,
        },
      };
    return {
      ok: false,
      error: {
        code: "DATABASE_ERROR",
        message: "The record could not be processed safely.",
      },
    };
  }
}
