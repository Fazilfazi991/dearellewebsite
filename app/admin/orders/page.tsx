import { OwnerOrders } from "@/components/owner-orders";
export const metadata = {
  title: "Owner orders",
  robots: { index: false, follow: false },
};
export default function OwnerPage() {
  return (
    <main id="main" className="section inner-page owner-page">
      <div className="page-heading">
        <h1>Owner orders.</h1>
        <p>Private test order management. No live payments or dispatches.</p>
      </div>
      <OwnerOrders />
    </main>
  );
}
