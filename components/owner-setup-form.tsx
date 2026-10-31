"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function OwnerSetupForm() {
  const router = useRouter();
  const [token, setToken] = useState(
      () =>
        new URLSearchParams(window.location.hash.slice(1)).get("token_hash") ??
        "",
    ),
    [type] = useState(
      () =>
        new URLSearchParams(window.location.hash.slice(1)).get("type") ?? "",
    ),
    [step, setStep] = useState(() => {
      const link = new URLSearchParams(window.location.hash.slice(1));
      return link.get("token_hash") &&
        ["invite", "recovery"].includes(link.get("type") ?? "")
        ? "exchange"
        : "invalid";
    }),
    [mfa, setMfa] = useState(false),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (step === "password" && password !== confirm) {
      setMessage("The passwords must match.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/owner/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          step === "exchange"
            ? { action: "exchange", tokenHash: token, type }
            : { action: "finish", password, code },
        ),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (step === "exchange") {
        setToken("");
        setMfa(d.mfaRequired);
        setStep("password");
      } else {
        setPassword("");
        setConfirm("");
        setCode("");
        setStep("done");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Setup could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (step === "loading") return <p role="status">Checking your setup link…</p>;
  if (step === "invalid")
    return (
      <p>
        This invitation link is missing or invalid. Request a new link from the
        authorized administrator.
      </p>
    );
  if (step === "done")
    return (
      <div className="owner-login">
        <p>
          Your password is saved. Sign in and verify your authenticator to
          access orders.
        </p>
        <button
          className="button"
          onClick={() => {
            router.replace("/admin/sign-in");
            router.refresh();
          }}
        >
          Continue to sign-in
        </button>
      </div>
    );
  return (
    <form className="owner-login" onSubmit={submit}>
      {step === "exchange" ? (
        <p>
          Continue to verify this one-time invitation or recovery link. Your
          email link alone does not grant access to customer orders.
        </p>
      ) : (
        <>
          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {mfa && (
            <label>
              Existing authenticator code
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
          )}
          <p className="small muted">
            Use a unique password of at least 12 characters. Existing
            authenticator protection is preserved. All owner sessions will be
            signed out.
          </p>
        </>
      )}
      <button className="button" disabled={busy}>
        {busy
          ? "Checking…"
          : step === "exchange"
            ? "Verify setup link"
            : "Save password securely"}
      </button>
      {message && <p role="alert">{message}</p>}
    </form>
  );
}
