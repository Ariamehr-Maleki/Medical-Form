"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-container py-20 text-center">
      <p className="eyebrow">Temporary problem</p>
      <h1 className="text-navy mt-4 text-3xl font-bold">
        Your workspace could not be loaded
      </h1>
      <p className="mt-3 text-slate-600">
        No record data was changed. Try the request again.
      </p>
      <button className="btn-primary mt-7" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
