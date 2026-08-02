import Link from "next/link";
export default function NotFound() {
  return (
    <main className="app-container py-20 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="text-navy mt-4 text-3xl font-bold">
        This record is unavailable
      </h1>
      <p className="mt-3 text-slate-600">
        It may not exist, or it belongs to a different account.
      </p>
      <Link className="btn-primary mt-7" href="/records">
        Return to records
      </Link>
    </main>
  );
}
