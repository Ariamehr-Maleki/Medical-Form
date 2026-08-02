export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "VALIDATION_ERROR"
  | "DUPLICATE"
  | "NOT_FOUND"
  | "DATABASE_ERROR"
  | "AUTH_ERROR";
export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code: AppErrorCode;
        message: string;
        fields?: Record<string, string[]>;
      };
    };
