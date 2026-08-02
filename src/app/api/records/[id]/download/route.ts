import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeCsvFilename } from "@/lib/medical-records/csv";
import { readNormalized } from "@/lib/medical-records/display";
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    const { data } = await supabase
      .from("medical_submissions")
      .select("id, csv_content, normalized_data")
      .eq("id", id)
      .maybeSingle();
    if (!data)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    const record = readNormalized(data.normalized_data);
    if (!record)
      return NextResponse.json(
        { error: "Stored record is invalid" },
        { status: 500 },
      );
    const filename = safeCsvFilename(record.admissionDate, data.id);
    return new NextResponse(data.csv_content, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "CSV download is unavailable" },
      { status: 503 },
    );
  }
}
