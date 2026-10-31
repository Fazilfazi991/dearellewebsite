import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section inner-page">
      <h1>A little off the beaten path.</h1>
      <p>We couldn’t find that page.</p>
      <Link href="/" className="button">
        Back to Dearelle
      </Link>
    </main>
  );
}
