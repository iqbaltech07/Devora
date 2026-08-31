"use client";

import { Shell } from "@/components/layout/Shell";
import { AuthCard } from "@/components/auth/AuthCard";

export default function SignUpPage() {
  return (
    <Shell>
      <div className="py-6 sm:py-12 flex items-center justify-center">
        <AuthCard initialMode="signup" />
      </div>
    </Shell>
  );
}
