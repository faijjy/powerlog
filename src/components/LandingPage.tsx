import Link from "next/link";
import "@/app/landing.css";

export function LandingPage({
  signedIn = false,
  appHref = "/onboarding",
}: {
  signedIn?: boolean;
  appHref?: string;
}) {
  return (
    <div className="min-h-full bg-[#0b1220] text-white">
      {/* Hero — one composition */}
      <section className="relative isolate min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 70% 20%, rgba(232,163,23,0.18), transparent 55%), radial-gradient(ellipse 70% 60% at 10% 80%, rgba(30,58,95,0.55), transparent 50%), linear-gradient(165deg, #0b1220 0%, #13233a 45%, #0f172a 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
          }}
        />

        <div className="landing-drift absolute -right-24 top-16 h-[28rem] w-[28rem] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 pb-10 pt-6 md:px-8">
          <header className="flex items-center justify-between gap-3">
            <p className="font-display text-xl font-bold tracking-tight text-white md:text-2xl">
              Power<span className="text-accent">Log</span>
            </p>
            <div className="flex items-center gap-2">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-fg transition hover:brightness-105"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-accent hover:text-accent"
                >
                  Log in
                </Link>
              )}
            </div>
          </header>

          <div className="mt-10 grid flex-1 items-center gap-10 lg:mt-0 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="landing-hero-copy max-w-xl">
              <p className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl">
                PowerLog
              </p>
              <h1 className="mt-5 font-display text-2xl font-semibold leading-snug text-white/95 sm:text-3xl md:text-4xl">
                Site materials & daily reports in a few taps.
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
                Built for electricians — log what&apos;s required, track what&apos;s
                used, and share clean WhatsApp or PDF reports with customers and
                bosses.
              </p>
              <div className="landing-hero-cta mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {signedIn ? (
                  <>
                    <Link
                      href={appHref}
                      className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-fg transition hover:brightness-105"
                    >
                      Open dashboard
                    </Link>
                    {appHref === "/admin" && (
                      <Link
                        href="/app"
                        className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
                      >
                        Electrician dashboard
                      </Link>
                    )}
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/50 sm:hidden"
                    >
                      Switch account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-accent-fg transition hover:brightness-105"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/50"
                    >
                      Create account
                    </Link>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs text-white/45">
                Same OTP screen for log in and new accounts — no password.
              </p>
            </div>

            <div className="landing-hero-visual relative mx-auto w-full max-w-md lg:max-w-none">
              <HeroPanel />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative border-t border-white/10 bg-[#f4f6f8] px-5 py-16 text-foreground md:px-8 md:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
            Workflow
          </p>
          <h2 className="font-display mt-2 max-w-xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
            From site arrival to WhatsApp share.
          </h2>
          <p className="mt-3 max-w-lg text-muted">
            Predefined electrical items keep you fast. Custom items keep you
            flexible when the site needs something new.
          </p>

          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                n: "01",
                title: "Create the site",
                body: "Customer name, phone, address, and notes — then start adding materials.",
              },
              {
                n: "02",
                title: "Log materials & work",
                body: "Pick from your library or add custom items. Track required vs used automatically.",
              },
              {
                n: "03",
                title: "Share the report",
                body: "One tap for WhatsApp table, plain text, or a professional PDF.",
              },
            ].map((step) => (
              <li key={step.n} className="relative border-t border-primary/15 pt-5">
                <span className="font-display text-sm font-bold text-accent">
                  {step.n}
                </span>
                <h3 className="font-display mt-2 text-xl font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-white px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
            Built for the field
          </p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
            Everything an electrician needs after a long day on site.
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <Feature
              title="Growing item library"
              body="Start with common MCBs, boards, wires, and switches. Save custom items so the next site is faster."
            />
            <Feature
              title="Required vs used"
              body="Know what’s left on site. Remaining quantity calculates itself as you update used amounts."
            />
            <Feature
              title="Daily work reports"
              body="Boards installed, wiring done, pending kitchen work — plus notes and site photos."
            />
            <Feature
              title="WhatsApp & PDF share"
              body="Send a clean table to the customer or boss in seconds. No formatting headaches."
            />
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-border bg-[#f4f6f8] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
              For teams
            </p>
            <h2 className="font-display mt-2 text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Admins see the whole crew. Electricians stay focused on the site.
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Create a company, invite electricians with a code, and track active
              sites and daily reports from one admin panel.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-fg transition hover:bg-primary/90"
            >
              Log in to create your company
            </Link>
          </div>
          <div className="space-y-4 font-display text-lg text-primary md:text-xl">
            <p className="border-l-4 border-accent pl-4">
              How many electricians are working today?
            </p>
            <p className="border-l-4 border-primary/25 pl-4 text-primary/80">
              Which sites are still in progress?
            </p>
            <p className="border-l-4 border-primary/25 pl-4 text-primary/80">
              What was shared in yesterday’s report?
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-white/10 px-5 py-20 md:px-8 md:py-28">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 0%, rgba(232,163,23,0.22), transparent 60%), #0b1220",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
            PowerLog
          </p>
          <p className="mt-4 text-lg text-white/70">
            Stop rewriting material lists. Start logging once and sharing
            instantly.
          </p>
          <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center sm:flex-row sm:justify-center sm:gap-3">
            <Link
              href="/login"
              className="inline-flex w-full rounded-xl bg-accent px-8 py-4 text-sm font-bold text-accent-fg transition hover:brightness-105 sm:w-auto"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="mt-3 inline-flex w-full rounded-xl border border-white/25 px-8 py-4 text-sm font-semibold text-white transition hover:border-white/50 sm:mt-0 sm:w-auto"
            >
              Create account
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            OTP log in · Mobile-first · WhatsApp ready
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0b1220] px-5 py-6 text-center text-xs text-white/35 md:px-8">
        © {new Date().getFullYear()} PowerLog · Site work & daily reports for
        electricians
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-primary/10 pt-5">
      <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function HeroPanel() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#111a2b]/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Today&apos;s site
          </p>
          <p className="font-display mt-1 text-lg font-semibold">
            Sharma Residence
          </p>
        </div>
        <span className="rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent">
          In progress
        </span>
      </div>

      <svg
        viewBox="0 0 320 120"
        className="mb-4 h-auto w-full text-accent/80"
        aria-hidden
      >
        <path
          className="landing-draw landing-pulse"
          d="M10 60 H70 L95 30 H150 L175 90 H230 L255 50 H310"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="70" cy="60" r="4" className="fill-accent" />
        <circle cx="150" cy="30" r="4" className="fill-white/80" />
        <circle cx="230" cy="90" r="4" className="fill-accent" />
      </svg>

      <div className="space-y-2 text-sm">
        <Row label="8 Module Board" value="4 Pc" />
        <Row label="Polycab 1.5mm" value="100 m" />
        <Row label="6A Switch" value="20 Pc" />
      </div>

      <div className="mt-5 flex gap-2">
        <span className="flex-1 rounded-lg bg-white/10 py-2.5 text-center text-xs font-semibold text-white/90">
          WhatsApp
        </span>
        <span className="flex-1 rounded-lg bg-accent py-2.5 text-center text-xs font-bold text-accent-fg">
          Share PDF
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
      <span className="text-white/75">{label}</span>
      <span className="tabular-nums font-semibold text-white">{value}</span>
    </div>
  );
}
