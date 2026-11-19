import { Navbar } from "@/components/Navbar";

const steps = [
  {
    step: "1. Stop and do not share more details",
    detail:
      "Do not share OTPs, PINs, passwords, card details, or send money. If you already shared sensitive credentials, change your passwords or PINs right away.",
  },
  {
    step: "2. Do not click suspicious links or download files",
    detail:
      "Avoid opening links from unknown senders or installing unknown apps/APKs requested through chat or SMS.",
  },
  {
    step: "3. Contact the official provider directly",
    detail:
      "If a bank, mobile financial service, courier, or platform is involved, reach them using the official number or website listed on their verified platform—not a number sent in a suspicious message.",
  },
  {
    step: "4. Save evidence before blocking",
    detail:
      "Take screenshots of the message, sender details, transaction IDs, and links, then block or report the sender inside the app you received it on.",
  },
  {
    step: "5. Report through verified official channels",
    detail:
      "Check the official websites or verified channels of your service provider, telecom regulator (such as BTRC), or cyber/emergency authorities to follow their current reporting instructions.",
  },
];

export default function WhatToDoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              What To Do If You Suspect or Faced a Scam
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Practical immediate steps to limit risk and verify official help channels.
            </p>
          </header>

          <ol className="space-y-4">
            {steps.map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <h2 className="text-base font-bold text-slate-900">{item.step}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {item.detail}
                </p>
              </li>
            ))}
          </ol>

          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <h2 className="text-sm font-bold text-amber-950">
              Checking Hotlines and Reporting Addresses
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
              Hotline numbers and reporting addresses can change over time. Always
              verify current contact details directly on the official website or
              verified social/support page of your bank, payment service, BTRC, or
              relevant cyber/police unit rather than relying on third-party posts.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}