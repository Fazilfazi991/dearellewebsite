import { OwnerOrders } from "@/components/owner-orders";
import { requireOwner } from "@/lib/owner-auth";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Owner orders",
  robots: { index: false, follow: false },
};
export default async function OwnerPage() {
  try {
    await requireOwner();
  } catch {
    redirect("/admin/sign-in");
  }
  return (
    <main id="main" className="section inner-page owner-page">
      <div className="page-heading">
        <h1>Owner orders.</h1>
        <p>Confirm orders, verify advances and manage dispatch.</p>
      </div>
      <OwnerOrders />
    </main>
  );
}
