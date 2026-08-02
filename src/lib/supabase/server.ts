import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";
export { isSupabaseConfigured };
export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const store = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          /* Proxy refreshes cookies when Server Components cannot write them. */
        }
      },
    },
  });
}
