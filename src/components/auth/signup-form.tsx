"use client";
import { useState } from "react";
import { CheckCircle2, LoaderCircle, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input } from "@/components/ui/forms";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("Use at least eight characters for your password.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error: authError } = await createClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${site}/auth/callback` },
      });
      if (authError) setError(authError.message);
      else setSent(true);
    } catch {
      setError(
        "Signup is unavailable. Check the Supabase configuration and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div className="grid gap-4 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
        <h2 className="text-navy text-2xl font-semibold">Check your email</h2>
        <p className="text-slate-600">
          Open the verification link sent to <strong>{email}</strong>. You must
          verify this address before accessing PulseVault.
        </p>
        <a href="/login" className="font-semibold text-teal-800">
          Return to sign in
        </a>
      </div>
    );
  return (
    <form className="grid gap-5" onSubmit={submit}>
      <Field label="Email address" required>
        <Input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password" required hint="At least eight characters.">
        <Input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="Confirm password" required>
        <Input
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>
      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      <Button disabled={busy}>
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}{" "}
        Create verified account
      </Button>
    </form>
  );
}
