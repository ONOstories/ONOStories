/* components/LoginForm.tsx */
"use client";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log("Logged-in");
        onSuccess();
      }}
      className="shadow-input rounded-2xl bg-white p-8 dark:bg-black"
    >
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
        Welcome back 👋
      </h2>

      <div className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-gradient-to-br from-[#4C1D95] to-[#2E1065] py-3 font-semibold text-white transition hover:opacity-90 active:scale-95"
        >
          Log&nbsp;in&nbsp;→
        </button>
      </div>
    </form>
  );
}
