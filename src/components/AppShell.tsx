import Link from "next/link";
import { ReactNode } from "react";

export function AppShell({
  children,
  title,
  backHref,
  right,
  nav = "app",
  brandHref = "/",
}: {
  children: ReactNode;
  title?: string;
  backHref?: string;
  right?: ReactNode;
  nav?: "app" | "admin" | "none";
  brandHref?: string;
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col pb-24">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="rounded-lg px-2 py-1 text-sm text-primary hover:bg-primary/5"
            >
              ← Back
            </Link>
          ) : (
            <Link
              href={brandHref}
              className="font-display text-lg font-semibold tracking-tight text-primary"
            >
              PowerLog
            </Link>
          )}
          {title && (
            <h1 className="flex-1 truncate text-center font-display text-base font-semibold">
              {title}
            </h1>
          )}
          <div className="ml-auto flex items-center gap-2">{right}</div>
        </div>
      </header>
      <main className="flex-1 px-4 py-4">{children}</main>
      {nav !== "none" && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-around px-2 py-2 text-xs">
            {nav === "app" ? (
              <>
                <NavLink href="/app" label="Dashboard" />
                <NavLink href="/app/sites/new" label="New Site" />
                <NavLink href="/app/library" label="Library" />
                <NavLink href="/app/settings" label="Settings" />
              </>
            ) : (
              <>
                <NavLink href="/admin" label="Dashboard" />
                <NavLink href="/admin/electricians" label="Team" />
                <NavLink href="/admin/sites" label="Sites" />
                <NavLink href="/admin/reports" label="Reports" />
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex min-w-[4.5rem] flex-col items-center rounded-lg px-3 py-2 font-medium text-muted hover:bg-primary/5 hover:text-primary"
    >
      {label}
    </Link>
  );
}
