import { describe, expect, it } from "vitest";
import {
  BLOOD_TYPES,
  medicalRecordInputSchema,
  normalizeMedicalRecord,
} from "@/lib/medical-records/schema";
import {
  CSV_HEADERS,
  parseMedicalCsv,
  safeCsvFilename,
  serializeMedicalRecord,
} from "@/lib/medical-records/csv";
import { sha256 } from "@/lib/medical-records/checksum";
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
describe("medical record validation", () => {
  it("accepts and normalizes a complete record", () =>
    expect(normalizeMedicalRecord(valid)).toMatchObject({
      name: "Jordan Lee",
      billingAmount: "1845.75",
    }));
  it.each(BLOOD_TYPES)("accepts blood type %s", (bloodType) =>
    expect(
      medicalRecordInputSchema.safeParse({ ...valid, bloodType }).success,
    ).toBe(true),
  );
  it.each([0, 120])("accepts boundary age %s", (age) =>
    expect(medicalRecordInputSchema.safeParse({ ...valid, age }).success).toBe(
      true,
    ),
  );
  it.each([-1, 1.5, 121])("rejects invalid age %s", (age) =>
    expect(medicalRecordInputSchema.safeParse({ ...valid, age }).success).toBe(
      false,
    ),
  );
  it("rejects a future date", () =>
    expect(
      medicalRecordInputSchema.safeParse({
        ...valid,
        admissionDate: "2999-01-01",
      }).success,
    ).toBe(false));
  it.each(["2026-02-30", "not-a-date", "2026-13-01"])(
    "rejects invalid calendar date %s",
    (admissionDate) =>
      expect(
        medicalRecordInputSchema.safeParse({ ...valid, admissionDate }).success,
      ).toBe(false),
  );
  it.each([
    ["1", "1.00"],
    ["1.2", "1.20"],
    ["0.01", "0.01"],
    ["10000000", "10000000.00"],
  ])("normalizes billing %s", (billingAmount, expected) =>
    expect(
      normalizeMedicalRecord({ ...valid, billingAmount }).billingAmount,
    ).toBe(expected),
  );
  it.each(["-1", "10000000.01", "1.234", NaN, Infinity])(
    "rejects invalid billing %s",
    (billingAmount) =>
      expect(
        medicalRecordInputSchema.safeParse({ ...valid, billingAmount }).success,
      ).toBe(false),
  );
  it("requires a custom condition for Other", () =>
    expect(
      medicalRecordInputSchema.safeParse({
        ...valid,
        medicalCondition: "Other",
        customCondition: "",
      }).success,
    ).toBe(false));
  it("requires a custom provider for Other", () =>
    expect(
      medicalRecordInputSchema.safeParse({
        ...valid,
        insuranceProvider: "Other",
        customInsuranceProvider: "",
      }).success,
    ).toBe(false));
  it("rejects unknown fields", () =>
    expect(
      medicalRecordInputSchema.safeParse({ ...valid, secret: "nope" }).success,
    ).toBe(false));
});
describe("canonical CSV", () => {
  it("uses exact canonical header order", () =>
    expect(
      serializeMedicalRecord(normalizeMedicalRecord(valid)).split("\r\n")[0],
    ).toBe(CSV_HEADERS.join(",")));
  it("escapes commas", () =>
    expect(
      serializeMedicalRecord(
        normalizeMedicalRecord({ ...valid, hospital: "Northstar, West" }),
      ),
    ).toContain('"Northstar, West"'));
  it("escapes quotation marks", () =>
    expect(
      serializeMedicalRecord(
        normalizeMedicalRecord({ ...valid, hospital: 'Northstar "West"' }),
      ),
    ).toContain('"Northstar ""West"""'));
  it("handles line breaks through the CSV library", () => {
    const record = normalizeMedicalRecord(valid);
    record.hospital = "Northstar\nWest";
    const csv = serializeMedicalRecord(record);
    expect(csv).toContain('"Northstar\nWest"');
    expect(parseMedicalCsv(csv).errors).toHaveLength(0);
  });
  it("round trips a canonical row", () => {
    const csv = serializeMedicalRecord(normalizeMedicalRecord(valid));
    const parsed = parseMedicalCsv(csv);
    expect(parsed.errors).toHaveLength(0);
    expect(parsed.data[0]?.Name).toBe("Jordan Lee");
    expect(parsed.data[0]?.["Billing Amount"]).toBe("1845.75");
  });
  it("produces stable checksums", () => {
    const csv = serializeMedicalRecord(normalizeMedicalRecord(valid));
    expect(sha256(csv)).toBe(sha256(csv));
    expect(sha256(csv)).toMatch(/^[a-f0-9]{64}$/);
  });
  it("generates safe download filenames", () => {
    expect(safeCsvFilename("2026-07-18", "abc-def-123")).toBe(
      "medical-record-2026-07-18-abcdef12.csv",
    );
    expect(safeCsvFilename("bad\r\nname", "../evil")).not.toMatch(/[\r\n/]/);
  });
});
