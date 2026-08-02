export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type Database = {
  public: {
    Tables: {
      medical_submissions: {
        Row: {
          id: string;
          user_id: string;
          schema_version: number;
          source: "manual" | "csv_upload";
          original_filename: string | null;
          row_count: number;
          csv_content: string;
          csv_sha256: string;
          normalized_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          schema_version?: number;
          source?: "manual" | "csv_upload";
          original_filename?: string | null;
          row_count?: number;
          csv_content: string;
          csv_sha256: string;
          normalized_data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          schema_version?: number;
          source?: "manual" | "csv_upload";
          original_filename?: string | null;
          row_count?: number;
          csv_content?: string;
          csv_sha256?: string;
          normalized_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
