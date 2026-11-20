import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
          <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xs">
            <span className="inline-flex items-center rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
              About Shotorko
            </span>
            <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Privacy-First Scam &amp; Link Awareness
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Shotorko helps people spot common scam patterns, phishing links,
              and urgent social-engineering tricks before they share sensitive
              codes or send money.
            </p>
          </header>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <h2 className="font-display text-lg font-bold text-slate-950">
                How It Works
              </h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
                <li>
                  <strong className="font-semibold text-slate-800">
                    100% Browser-Only Analysis:
                  </strong>{" "}
                  Every message and link you check stays on your device. No text
                  is uploaded or logged on any external server.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800">
                    Transparent Signals &amp; Link Checks:
                  </strong>{" "}
                  Instead of a black-box label, Shotorko highlights suspicious
                  phrases, inspects lookalike domains, redirect parameters, and
                  explains why each signal triggered.
                </li>
                <li>
                  <strong className="font-semibold text-slate-800">
                    Local Privacy Safeguards:
                  </strong>{" "}
                  Optional recent-check history is saved only in your
                  browser&apos;s local storage with long digit sequences (like
                  OTPs or phone numbers) automatically masked.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    About the Developer
                  </span>
                  <h2 className="font-display mt-1 text-xl font-bold text-slate-950">
                    Sajid Ahmed
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Student Developer
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://www.facebook.com/profile.php?id=100087148034554"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-900"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.linkedin.com/in/sajid-ahmed-433499401?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-indigo-700"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Hi, I&apos;m Sajid — a student developer passionate about
                software engineering, practical web &amp; mobile tools, and
                solving everyday digital safety problems. I built Shotorko so
                anyone can quickly double-check suspicious messages and links
                without sacrificing their privacy.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Next.js",
                  "TypeScript",
                  "Tailwind CSS",
                  "Client-Side Security",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-4 text-xs text-slate-500">
              <span>
                Note: Shotorko is an assistive awareness tool, not a guarantee
                of safety.
              </span>
              <Link
                href="/"
                className="shrink-0 font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ← Back to Checker
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}