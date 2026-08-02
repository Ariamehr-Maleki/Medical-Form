export default function Loading() {
  return (
    <main
      className="app-container animate-pulse py-10"
      aria-label="Loading dashboard"
    >
      <div className="h-10 w-72 rounded-lg bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200" />
        ))}
      </div>
      <div className="mt-8 h-72 rounded-2xl bg-slate-200" />
    </main>
  );
}
