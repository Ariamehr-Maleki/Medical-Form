import { describe, expect, it, vi } from "vitest";
import {
  persistMedicalRecord,
  type SubmissionInsert,
} from "@/lib/medical-records/persistence";
const valid = {
  name: "Jordan Lee",
  age: 42,
  gender: "Other",
  bloodType: "O+",
  medicalCondition: "Asthma",
  customCondition: "",
  admissionDate: "2026-07-18",
  doctor: "Dr. Maya Chen",
  hospital: "Northstar Medical Center",
  insuranceProvider: "Cigna",
  customInsuranceProvider: "",
  billingAmount: "1845.75",
};
describe("submission persistence boundary", () => {
  it("rejects unauthenticated submissions without a database write", async () => {
    const insert = vi.fn();
    const result = await persistMedicalRecord(valid, null, insert);
    expect(result.ok).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });
  it("rejects invalid input without a database write", async () => {
    const insert = vi.fn();
    const result = await persistMedicalRecord(
      { ...valid, age: 121 },
      "user-a",
      insert,
    );
    expect(result.ok).toBe(false);
    expect(insert).not.toHaveBeenCalled();
  });
  it("stores valid CSV with server-derived owner", async () => {
    let captured: SubmissionInsert | undefined;
    const result = await persistMedicalRecord(
      valid,
      "user-a",
      async (value) => {
        captured = value;
        return {
          data: { id: "record-a", created_at: "2026-08-02T00:00:00Z" },
          error: null,
        };
      },
    );
    expect(result.ok).toBe(true);
    expect(captured?.user_id).toBe("user-a");
    expect(captured?.csv_content).toContain("Jordan Lee");
    expect(captured?.csv_sha256).toMatch(/^[a-f0-9]{64}$/);
  });
  it("returns a duplicate warning on checksum conflict", async () => {
    const result = await persistMedicalRecord(valid, "user-a", async () => ({
      data: null,
      error: { code: "23505" },
    }));
    expect(result).toMatchObject({ ok: false, error: { code: "DUPLICATE" } });
  });
});
