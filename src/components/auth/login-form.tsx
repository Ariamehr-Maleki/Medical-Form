"use client";
import { useEffect, useState } from "react";
import { KeyRound, LoaderCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Field, Input } from "@/components/ui/forms";

export function LoginForm({
  next = "/dashboard",
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [mode, setMode] = useState<"password" | "request" | "sent">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    initialError === "confirmation_failed"
      ? "That email link is invalid or expired. Request a new sign-in link."
      : initialError === "unverified"
        ? "Verify your email before accessing your workspace."
        : "",
  );
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  async function passwordLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signInWithPassword(
        { email, password },
      );
      if (authError) {
        setError(
          authError.message.toLowerCase().includes("confirm")
            ? "Verify your email before signing in."
            : "Email or password is incorrect.",
        );
      } else {
        window.location.assign(next);
      }
    } catch {
      setError(
        "Authentication is unavailable. Check the Supabase configuration and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink() {
    if (cooldown) return;
    setBusy(true);
    setError("");
    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", next);
      const { error: authError } = await createClient().auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callbackUrl.toString(),
        },
      });
      if (authError) {
        setError(
          "We could not send a sign-in link. Confirm the account exists and try again.",
        );
      } else {
        setMode("sent");
        setCooldown(45);
      }
    } catch {
      setError(
        "Email sign-in is unavailable. Check the Supabase configuration.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (mode === "password") {
    return (
      <form className="grid gap-5" onSubmit={passwordLogin}>
        <Field label="Email address" required>
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}{" "}
          Sign in securely
        </Button>
        <button
          type="button"
          className="text-sm font-semibold text-teal-800 underline-offset-4 hover:underline"
          onClick={() => {
            setMode("request");
            setError("");
          }}
        >
          Email me a sign-in link instead
        </button>
      </form>
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void sendMagicLink();
      }}
    >
      <Field
        label="Email address"
        required
        hint={
          mode === "sent"
            ? `We sent a secure sign-in link to ${email}.`
            : "Use the email connected to your verified account."
        }
      >
        <Input
          type="email"
          autoComplete="email"
          required
          disabled={mode === "sent"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      {mode === "sent" && (
        <p
          className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900"
          role="status"
        >
          Open the email and click the single-use link to finish signing in.
        </p>
      )}
      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {mode === "request" && (
        <Button type="submit" disabled={busy}>
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Send secure sign-in link
        </Button>
      )}
      {mode === "sent" && (
        <button
          type="button"
          disabled={cooldown > 0 || busy}
          onClick={() => void sendMagicLink()}
          className="text-sm font-semibold text-teal-800 disabled:text-slate-400"
        >
          {cooldown ? `Resend in ${cooldown}s` : "Resend sign-in link"}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setMode("password");
          setError("");
        }}
        className="text-sm text-slate-600 hover:text-slate-950"
      >
        Back to password sign in
      </button>
    </form>
  );
}
