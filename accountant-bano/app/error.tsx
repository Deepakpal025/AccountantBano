"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>We couldn’t load this page.</h1>
      <p>
        Please check your connection and try again. If this continues, contact
        the academy.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <a href="/contact">Contact support</a>
    </main>
  );
}
