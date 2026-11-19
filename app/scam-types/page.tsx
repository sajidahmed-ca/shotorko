import { Navbar } from "@/components/Navbar";

const scamTypes = [
  {
    title: "OTP, PIN, or Password Theft",
    summary:
      "Scammers pretend to be support, delivery agents, or bank staff and ask for a one-time code, PIN, or password to 'verify' or 'cancel' something.",
    watchOut: "Never share OTPs or PINs—even if the caller sounds polite or urgent.",
  },
  {
    title: "Wrong Money Transfer / Refund Trick",
    summary:
      "Someone claims they accidentally sent money to your account or shows a fake transfer screenshot and asks you to send it back.",
    watchOut:
      "Check your actual balance and statement inside the official app before taking any action.",
  },
  {
    title: "Fake Lottery, Prize, or Cashback",
    summary:
      "Unsolicited messages claiming you won a prize, bonus, or gift, often pushing you to click a link or pay a small fee to claim it.",
    watchOut: "If you did not enter a verified promotion, treat unexpected prizes with suspicion.",
  },
  {
    title: "Account Suspension or Fake KYC Alert",
    summary:
      "Messages warning that your account will be blocked or suspended unless you complete urgent KYC or verification via a link.",
    watchOut: "Open the official app or website directly instead of tapping links in texts.",
  },
  {
    title: "Part-Time Job & Easy Income Scams",
    summary:
      "Offers promising high daily pay for simple online tasks, likes, or reviews—often asking you to deposit money first to earn higher tiers.",
    watchOut: "Be cautious of any job that asks you to pay money upfront to unlock earnings.",
  },
  {
    title: "Upfront Fee or Advance Payment Scams",
    summary:
      "Demands for processing fees, taxes, customs charges, or security deposits before releasing a loan, parcel, or reward.",
    watchOut: "Verify charges through official channels and avoid paying strangers via instant transfer.",
  },
  {
    title: "Impersonation of Support or Officials",
    summary:
      "Messages or chats claiming to come from customer care, a bank, a courier, or an official agency with a problem needing immediate attention.",
    watchOut: "Look up official contact numbers independently rather than trusting numbers in the message.",
  },
  {
    title: "Phishing Links & Lookalike Pages",
    summary:
      "Shortened URLs or slightly misspelled domains designed to steal login credentials, card numbers, or personal data.",
    watchOut: "Inspect the actual domain carefully and avoid entering passwords on unfamiliar links.",
  },
];

export default function ScamTypesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Common Scam Types
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Recognize recurring patterns used in suspicious messages, calls, and links.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            {scamTypes.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.summary}
                </p>
                <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs font-medium text-slate-800">
                  Tip: {item.watchOut}
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}