"use client";
import dynamic from "next/dynamic";
// One-time link fragments are read only in the browser, never during SSR.
const SetupForm = dynamic(() => import("./owner-setup-form"), {
  ssr: false,
  loading: () => <p role="status">Checking your setup link…</p>,
});
export function OwnerSetup() {
  return <SetupForm />;
}
