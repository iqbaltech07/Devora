import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h2 className="text-3xl font-bold text-devora-ink">404 - Page Not Found</h2>
      <p className="text-sm text-devora-muted">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button size="md" className="bg-devora-brand text-white">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
