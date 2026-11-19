import { Navbar } from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              About Shotorko
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Purpose, privacy approach, and honest limitations.
            </p>
          </header>

          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Purpose</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Shotorko helps everyday users spot common red flags in suspicious
                messages and links quickly before acting on them.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Privacy First</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Messages you paste are analyzed locally in your browser using
                client-side rules. They are not sent to an external server or stored
                in a database by this tool.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Limitations</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Rule matching highlights common warning signs—it is not proof of a
                scam, and a low-risk score does not guarantee safety. Always double-check
                through official channels when money, accounts, or personal data are
                involved.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}