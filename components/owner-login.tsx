"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function OwnerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/owner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPassword("");
      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="owner-login" onSubmit={submit}>
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
      <button className="button" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {message && <p role="alert">{message}</p>}
      <p className="small muted">
        Authorized owner only. Sessions lock after 30 minutes of inactivity.
      </p>
    </form>
  );
}
