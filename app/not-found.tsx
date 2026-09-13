import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <h1>This page isn’t available.</h1>
      <Link className="button" href="/">
        Back to the academy
      </Link>
    </main>
  );
}
