import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  hash,
  orderRepository,
  testOrdersEnabled,
} from "@/lib/order-repository";
import { money } from "@/lib/products";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your test request",
  robots: { index: false, follow: false },
};
export default async function OrderConfirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = (await cookies()).get("dearelle_guest")?.value;
  if (!token || !testOrdersEnabled()) notFound();
  const order = orderRepository().get(id, hash(token));
  if (!order) notFound();
  return (
    <main id="main" className="section inner-page confirmation-page">
      <div className="page-heading">
        <h1>Test request received.</h1>
        <p>
          No payment was taken. This request will not create a real delivery.
        </p>
      </div>
      <p className="notice">
        {order.fulfilment.replaceAll("_", " ")} ·{" "}
        {order.payment.replaceAll("_", " ")}
      </p>
      <p>
        In the COD flow, we contact you before dispatch and manually confirm the
        ₹50 advance. It is deducted from your total.
      </p>
      <p className="small muted">
        Reference {order.id}
        <br />
        {order.customer.name} · {order.customer.email}
      </p>
      <div className="order-summary">
        <h2>Your request</h2>
        {order.quote.lines.map((line) => (
          <div key={line.sku}>
            <span>
              {line.name}
              <small>
                {line.color} · Qty {line.quantity} · {line.sku}
              </small>
            </span>
            <strong>{money(line.lineTotal)}</strong>
          </div>
        ))}
        <div>
          <span>Total · Free delivery</span>
          <strong>{money(order.quote.total)}</strong>
        </div>
        <div>
          <span>Advance included in total</span>
          <strong>{money(order.quote.advance)}</strong>
        </div>
        <div>
          <span>Remaining COD balance</span>
          <strong>{money(order.quote.codBalance)}</strong>
        </div>
      </div>
      <Link href="/new-arrivals" className="button">
        Continue shopping
      </Link>
    </main>
  );
}
