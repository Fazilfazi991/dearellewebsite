import { OwnerLogin } from "@/components/owner-login";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Owner sign-in",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main id="main" className="section inner-page owner-page">
      <div className="page-heading">
        <h1>Owner access.</h1>
        <p>Sign in with your email and password.</p>
      </div>
      <OwnerLogin />
    </main>
  );
}
