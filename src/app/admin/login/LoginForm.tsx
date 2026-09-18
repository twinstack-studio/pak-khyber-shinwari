"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { signInAction } from "../actions";

type Labels = {
  email: string;
  password: string;
  submit: string;
  submitting: string;
};

function SubmitButton({ labels }: { labels: Labels }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-pks-500 hover:bg-pks-600 mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors disabled:opacity-70"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending ? labels.submitting : labels.submit}
    </button>
  );
}

export function LoginForm({ labels }: { labels: Labels }) {
  const [state, action] = useActionState(signInAction, {});

  return (
    <form action={action}>
      <label htmlFor="email" className="text-ink-700 mb-2 block text-sm font-semibold">
        {labels.email}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="username"
        autoFocus
        className="border-paper-400 text-ink-800 focus:border-pks-500 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors"
      />

      <label
        htmlFor="password"
        className="text-ink-700 mt-5 mb-2 block text-sm font-semibold"
      >
        {labels.password}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        className="border-paper-400 text-ink-800 focus:border-pks-500 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors"
      />

      {state?.error && (
        <p className="bg-pks-50 text-pks-700 mt-5 flex items-start gap-2 rounded-xl p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton labels={labels} />
    </form>
  );
}

export default LoginForm;
