import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { persistMedicalRecord } from "@/lib/medical-records/persistence";
export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length") || 0) > 25_000)
    return NextResponse.json(
      {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Request is too large." },
      },
      { status: 413 },
    );
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const body: unknown = await request.json();
    const result = await persistMedicalRecord(
      body,
      user?.email_confirmed_at ? user.id : null,
      async (value) => {
        const response = await supabase
          .from("medical_submissions")
          .insert(value)
          .select("id, created_at")
          .single();
        return { data: response.data, error: response.error };
      },
    );
    if (result.ok) return NextResponse.json(result, { status: 201 });
    const status =
      result.error.code === "AUTH_REQUIRED"
        ? 401
        : result.error.code === "VALIDATION_ERROR"
          ? 400
          : result.error.code === "DUPLICATE"
            ? 409
            : 503;
    return NextResponse.json(result, { status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "DATABASE_ERROR",
          message: "The record could not be processed safely.",
        },
      },
      { status: 500 },
    );
  }
}
