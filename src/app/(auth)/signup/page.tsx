import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignupForm } from "@/components/auth/signup-form";
export const metadata = { title: "Create account" };
export default function SignupPage() {
  return (
    <main className="auth-shell">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Brand />
          <h1 className="text-navy mt-8 text-3xl font-bold">
            Create your secure workspace
          </h1>
          <p className="mt-2 text-slate-600">
            Verify your email before accessing medical records.
          </p>
        </div>
        <section className="panel p-6 sm:p-8">
          <SignupForm />
          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-teal-800">
              Sign in
            </Link>
          </p>
        </section>
        <p className="mt-6 text-center text-xs text-slate-500">
          Demo only. Never enter real patient information.
        </p>
      </div>
    </main>
  );
}
