import Link from "next/link";
import { Activity } from "lucide-react";
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 text-lg font-bold tracking-tight ${inverse ? "text-white" : "text-navy"}`}
    >
      <span className="grid size-9 place-items-center rounded-xl bg-teal-600 text-white">
        <Activity className="size-5" />
      </span>
      PulseVault
    </Link>
  );
}
