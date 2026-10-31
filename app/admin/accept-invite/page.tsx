import { OwnerSetup } from "@/components/owner-setup";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Secure owner setup",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main id="main" className="section inner-page owner-page">
      <div className="page-heading">
        <h1>Secure owner setup.</h1>
        <p>For the authorized Dearelle owner.</p>
      </div>
      <OwnerSetup />
    </main>
  );
}
