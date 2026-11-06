"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticateAdmin } from "../../app/admin/actions";
import BrandLogo from "../shared/BrandLogo";
import { ShieldIcon } from "../shared/Icons";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-white px-5 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Checking access..." : "Unlock Admin"}
    </button>
  );
}

export default function AdminAccessGate() {
  const [state, formAction] = useFormState(authenticateAdmin, { error: "" });

  return (
    <div className="min-h-screen bg-[#050505] px-5 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.34)]">
        <BrandLogo href="/" size="sm" className="mb-5" />
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/12 text-teal-200">
          <ShieldIcon className="h-6 w-6" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.35em] text-teal-300">Protected admin area</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Secure access for Aruvi operators only.</h1>
        <p className="mt-4 text-sm leading-7 text-white/62">
          Use the admin access key to open analytics, manage orders, and add products to the storefront catalog.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">Admin Access Key</span>
            <input
              name="accessKey"
              type="password"
              placeholder="Enter secure key"
              className="w-full rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-teal-300"
            />
          </label>
          {state?.error ? <p className="text-sm text-teal-200">{state.error}</p> : null}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
