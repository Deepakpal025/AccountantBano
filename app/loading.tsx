export default function Loading() {
  return (
    <main className="loading" role="status" aria-label="Loading">
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
      <p>Loading your learning space…</p>
    </main>
  );
}
