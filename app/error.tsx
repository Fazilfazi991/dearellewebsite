"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="section inner-page">
      <h1>Something didn’t load.</h1>
      <p>Please try again. Your bag stays on this device.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
