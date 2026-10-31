"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function OwnerLogin() {
  const router = useRouter();
  const [step, setStep] = useState("login"),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [factor, setFactor] = useState(""),
    [qr, setQr] = useState(""),
    [secret, setSecret] = useState(""),
    [code, setCode] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function call(body: Record<string, string>) {
    const r = await fetch("/api/owner/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    return d;
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      if (step === "login") {
        await call({ action: "login", email, password });
        setPassword("");
        const d = await call({ action: "factors" });
        if (d.factors.length) {
          setFactor(d.factors[0].id);
        } else {
          const setup = await call({ action: "enroll" });
          setFactor(setup.factorId);
          setQr(setup.qr);
          setSecret(setup.secret);
        }
        setStep("mfa");
      } else {
        await call({ action: "verify", factorId: factor, code });
        router.push("/admin/orders");
        router.refresh();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="owner-login" onSubmit={submit}>
      {step === "login" ? (
        <>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </>
      ) : (
        <>
          {qr && (
            <>
              <p>Scan with your authenticator. Keep your setup key private.</p>
              {/* Supabase generates this QR SVG; no arbitrary markup is injected. */}
              {/* Auth QR is a private data URI; image optimization is inappropriate. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr}
                alt="Authenticator setup QR"
                width={220}
                height={220}
              />
              <details>
                <summary>Manual setup key</summary>
                <code style={{ overflowWrap: "anywhere" }}>{secret}</code>
              </details>
            </>
          )}
          <label>
            Authenticator code
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
        </>
      )}
      <button className="button" disabled={busy}>
        {busy
          ? "Checking…"
          : step === "login"
            ? "Continue securely"
            : "Verify & open orders"}
      </button>
      {step === "mfa" && (
        <button
          className="text-link"
          type="button"
          disabled={busy}
          onClick={() => {
            setStep("login");
            setQr("");
            setSecret("");
            setCode("");
            setMessage("");
          }}
        >
          Back to sign-in
        </button>
      )}
      {message && <p role="alert">{message}</p>}
      <p className="small muted">
        Authorized owner only. Authenticator verification is required. Sessions
        lock after 30 minutes of inactivity.
      </p>
    </form>
  );
}
