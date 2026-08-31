import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-devora-border bg-devora-background py-8 pb-20 md:pb-8">
      <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8 text-xs text-devora-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-devora-ink">Devora</span>
          <span>— Find someone worth building with.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-devora-ink transition-colors">
            Discover
          </Link>
          <Link href="/projects" className="hover:text-devora-ink transition-colors">
            Projects
          </Link>
          <Link href="/matches" className="hover:text-devora-ink transition-colors">
            Matches
          </Link>
          <span className="font-mono text-[10px] text-devora-muted-strong">
            v0.1.0 · Anti-Slop Architecture
          </span>
        </div>
      </div>
    </footer>
  );
}
