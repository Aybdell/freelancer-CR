"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-10">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-2 h-2 rounded-sm bg-[#7c3aed]" />
          <span className="text-lg font-semibold text-[#f0f0f0]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
            Dev AI
          </span>
        </div>

        <h1 className="text-[22px] font-semibold text-[#f0f0f0] text-center">
          Create your account
        </h1>
        <p className="text-sm text-[#888888] text-center mt-1">
          Start reviewing code for free
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-[13px] text-[#888888] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#555555] focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] text-[#888888] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#555555] focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] text-[#888888] mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#555555] focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] text-[#888888] mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-[#f0f0f0] placeholder:text-[#555555] focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer mt-2 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#888888]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#7c3aed] hover:text-[#a78bfa] transition-colors no-underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
