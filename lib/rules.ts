export type RiskLevel = "low" | "medium" | "high";

export type Rule = {
  id: string;
  label: string;
  pattern: RegExp;
  score: number;
  advice: string;
};

export const rules: Rule[] = [
  {
    id: "asks-otp-pin",
    label: "Asks you to share or enter an OTP, PIN, or verification code",
    pattern:
      /\b(share|send|give|enter|provide|confirm|tell)\b.{0,30}\b(otp|pin|one-time password|verification code|2fa|passcode)\b|\b(otp|pin|verification code|2fa)\b.{0,25}\b(request|needed|required)\b/i,
    score: 5,
    advice:
      "Legitimate banks, payment apps, or support agents never ask you to share or enter your OTP, PIN, or code via messages or calls.",
  },
  {
    id: "wrong-transfer-excuse",
    label: "Claims money was sent by mistake or asks you to send it back",
    pattern:
      /\b(sent by mistake|wrong number|by mistake|send it back|refund me|return the money|transfer back|mistakenly sent)\b/i,
    score: 4,
    advice:
      "Check your real balance and transaction history directly inside your official app—never rely only on screenshots or urgent calls.",
  },
  {
    id: "prize-lottery-bait",
    label: "Promotes an unexpected prize, lottery win, or bonus claim",
    pattern:
      /\b(won a (prize|lottery|reward|gift)|lottery winner|claim your (prize|reward|bonus|gift)|free (iphone|cash|bonus|gift card))\b/i,
    score: 4,
    advice:
      "Unexpected prize or giveaway messages are common lures. Verify promotions only through official channels.",
  },
  {
    id: "account-threat-kyc",
    label: "Threatens account suspension/blocking or pushes urgent KYC action",
    pattern:
      /\b(account will be (suspended|blocked|locked|closed|deactivated)|suspended within|urgent kyc|update kyc|verify your account now|unusual sign-?in)\b/i,
    score: 4,
    advice:
      "Avoid clicking links in threatening account alerts. Open the official app or website on your own to check your status.",
  },
  {
    id: "suspicious-links",
    label: "Contains shortened, chat-redirect, or high-risk domain links",
    pattern:
      /(https?:\/\/)?(bit\.ly|tinyurl\.com|t\.me|wa\.me|ngrok|[^\s]+\.(xyz|top|click|icu|rest|gq|tk|ml|ga|cf|zip|mov))\b/i,
    score: 3,
    advice:
      "Shortened or unfamiliar links can hide phishing pages. Do not open them unless you independently trust the source.",
  },
  {
    id: "too-good-job-income",
    label: "Promotes easy work-from-home pay, task commissions, or quick profit",
    pattern:
      /\b(earn .{0,20}(daily|per day|weekly)|easy money|work from home.{0,30}(earn|income|salary)|guaranteed profit|task commission|part[- ]?time.{0,20}(income|earn))\b/i,
    score: 3,
    advice:
      "Be cautious of messaging-app job or earning offers that promise fast money or ask you to pay first to unlock tasks.",
  },
  {
    id: "upfront-fee-request",
    label: "Requests an upfront fee, deposit, tax, or clearance charge",
    pattern:
      /\b(pay .{0,25}(fee|tax|charge|deposit|clearance)|processing fee|advance fee|registration fee|pay to unlock|release fee)\b/i,
    score: 3,
    advice:
      "Scammers often ask for small upfront payments before releasing supposed funds, loans, or parcels.",
  },
  {
    id: "impersonation-authority",
    label: "Claims to be support, bank, courier, or authority needing action",
    pattern:
      /\b(customer care|helpline|support team|bank security|customs department|delivery failed|parcel held|official notice)\b/i,
    score: 2,
    advice:
      "Anyone can claim to be support or an official in text or chat. Look up official contact numbers independently.",
  },
  {
    id: "personal-id-request",
    label: "Requests sensitive ID, card, or password details",
    pattern:
      /\b(share|send|enter|provide|confirm)\b.{0,30}\b(nid|national id|passport|card number|cvv|password|date of birth)\b/i,
    score: 4,
    advice:
      "Keep ID numbers, card details, and passwords private—especially on pages opened from unsolicited messages.",
  },
  {
    id: "urgency-pressure",
    label: "Uses strong urgency or countdown pressure to rush you",
    pattern:
      /\b(urgent|urgently|immediately|within \d+ hours?|last chance|final warning|act now|expires in \d+)\b/i,
    score: 2,
    advice:
      "Urgency is often used to rush decisions. Pause and verify before acting.",
  },
];