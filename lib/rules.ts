export type RiskLevel = "low" | "medium" | "high";

export type Rule = {
  id: string;
  label: string;
  pattern: RegExp;
  score: number;
  advice: string;
  // true = ignore matches that are part of a warning ("never share your OTP")
  negatable?: boolean;
};

// Combine English, Bangla and Banglish (Bangla in Latin letters) patterns into one rule.
// Note: \b does not work next to Bangla letters, so Bangla patterns avoid it.
function anyOf(...parts: RegExp[]): RegExp {
  return new RegExp(parts.map((p) => p.source).join("|"), "i");
}

export const rules: Rule[] = [
  {
    id: "asks-otp-pin",
    label: "Asks you to share or enter an OTP, PIN, or verification code",
    negatable: true,
    pattern: anyOf(
      /\b(share|send|give|enter|provide|confirm|tell)\b.{0,30}\b(otp|pin|one-time password|verification code|2fa|passcode)\b|\b(otp|pin|verification code|2fa)\b.{0,25}\b(request|needed|required)\b/,
      // Bangla: "ওটিপি দিন", "পিন শেয়ার করুন", "কোড বলুন"
      /(ওটিপি|ও\.টি\.পি|পিন|ভেরিফিকেশন কোড|ভেরিফাই কোড|কনফার্মেশন কোড|পাসওয়ার্ড).{0,25}(দিন|দিয়ে দিন|শেয়ার|বলুন|পাঠান|জানান|লিখুন)|(দিন|শেয়ার করুন|বলুন|পাঠান|জানান).{0,25}(ওটিপি|পিন|ভেরিফিকেশন কোড|ভেরিফাই কোড)/,
      // Banglish: "otp din", "pin bolun"
      /\b(otp|pin|code)\b.{0,25}\b(din|den|dao|dien|bolun|bolen|bolo|pathan|pathao|janan|share koren|share korun)\b|\b(din|den|bolun|pathan|janan|share koren|share korun)\b.{0,25}\b(otp|pin)\b/
    ),
    score: 5,
    advice:
      "Legitimate banks, payment apps, or support agents never ask you to share or enter your OTP, PIN, or code via messages or calls.",
  },
  {
    id: "wrong-transfer-excuse",
    label: "Claims money was sent by mistake or asks you to send it back",
    pattern: anyOf(
      /\b(sent by mistake|wrong number|by mistake|send it back|refund me|return the money|transfer back|mistakenly sent)\b/,
      // Bangla: "ভুল নম্বরে টাকা চলে গেছে", "টাকা ফেরত দিন"
      /(ভুল(ে)? (নম্বরে|নাম্বারে|নম্বর|নাম্বার)|ভুলে.{0,20}(পাঠিয়ে|চলে গেছে|চলে এসেছে|চলে গিয়েছে)|ফেরত (দিন|দেন|পাঠান|পাঠিয়ে দিন)|টাকা ফেরত)/,
      // Banglish: "vul number e taka chole gese", "taka ferot din"
      /\b(vul|bhul|vull)\b.{0,12}\b(number|nombor|numbere|e)\b|\b(vule|bhule)\b|\b(ferot|ferat|fert)\b.{0,12}\b(din|den|pathan|dien|dao)\b|\btaka (ferot|ferat)\b/
    ),
    score: 4,
    advice:
      "Check your real balance and transaction history directly inside your official app—never rely only on screenshots or urgent calls.",
  },
  {
    id: "prize-lottery-bait",
    label: "Promotes an unexpected prize, lottery win, or bonus claim",
    pattern: anyOf(
      /\b(won a (prize|lottery|reward|gift)|lottery winner|claim your (prize|reward|bonus|gift)|free (iphone|cash|bonus|gift card))\b/,
      // Bangla: "লটারি জিতেছেন", "বোনাস দাবি করুন"
      /(জিতেছেন|বিজয়ী হয়েছেন|বিজয়ী নির্বাচিত|লটারি(তে)? জিত|লটারির বিজয়ী|পুরস্কার দাবি|বোনাস দাবি|উপহার দাবি)/,
      // Banglish
      /\b(lottery jitechen|jitechen|jitesen|puroskar|purushkar|bonus claim)\b/
    ),
    score: 4,
    advice:
      "Unexpected prize or giveaway messages are common lures. Verify promotions only through official channels.",
  },
  {
    id: "account-threat-kyc",
    label: "Threatens account suspension/blocking or pushes urgent KYC action",
    pattern: anyOf(
      /\b(account will be (suspended|blocked|locked|closed|deactivated)|suspended within|urgent kyc|update kyc|verify your account now|unusual sign-?in)\b/,
      // Bangla: "অ্যাকাউন্ট বন্ধ হয়ে যাবে", "কেওয়াইসি আপডেট করুন"
      /((অ্যাকাউন্ট|একাউন্ট|অ্যাকাউন্ট|হিসাব).{0,25}(বন্ধ|ব্লক|স্থগিত|সাসপেন্ড|লক)|(কেওয়াইসি|কেওয়াইসি|kyc).{0,20}(আপডেট|হালনাগাদ|সম্পন্ন|যাচাই))/,
      // Banglish: "account bondho hoye jabe", "kyc update korun"
      /\baccount\b.{0,25}\b(bondho|bandho|block|suspend|lock)\b|\b(bondho|block) hoye (jabe|jaben)\b|\bkyc\b.{0,20}\b(update|korun|koren|verify)\b/
    ),
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
    pattern: anyOf(
      /\b(earn .{0,20}(daily|per day|weekly)|easy money|work from home.{0,30}(earn|income|salary)|guaranteed profit|task commission|part[- ]?time.{0,20}(income|earn))\b/,
      // Bangla: "ঘরে বসে আয় করুন", "প্রতিদিন ৩০০০ টাকা ইনকাম"
      /(ঘরে বসে.{0,25}(আয়|ইনকাম|টাকা|উপার্জন)|প্রতিদিন.{0,20}(আয়|ইনকাম|উপার্জন)|ইনকাম করুন|আয় করুন|পার্ট ?টাইম.{0,15}(জব|চাকরি|আয়)|টাস্ক.{0,15}(কমিশন|সম্পন্ন)|নিশ্চিত লাভ)/,
      // Banglish
      /\b(ghore (bose|boshe).{0,25}(income|taka|earn)|income korun|part ?time job|daily .{0,12}taka .{0,10}(income|earn))\b/
    ),
    score: 3,
    advice:
      "Be cautious of messaging-app job or earning offers that promise fast money or ask you to pay first to unlock tasks.",
  },
  {
    id: "upfront-fee-request",
    label: "Requests an upfront fee, deposit, tax, or clearance charge",
    pattern: anyOf(
      /\b(pay .{0,25}(fee|tax|charge|deposit|clearance)|processing fee|advance fee|registration fee|pay to unlock|release fee)\b/,
      // Bangla: "রেজিস্ট্রেশন ফি", "আগে টাকা পাঠান"
      /(রেজিস্ট্রেশন ফি|প্রসেসিং ফি|ক্লিয়ারেন্স ফি|ট্যাক্স জমা|চার্জ জমা|ফি জমা|আগে.{0,15}(টাকা|ফি).{0,10}(দিতে|পাঠাতে|জমা|দিন|পাঠান))/,
      // Banglish
      /\b(registration fee|processing fee|fee jama|(age|agey) taka .{0,15}(den|dite|pathan|dien))\b/
    ),
    score: 3,
    advice:
      "Scammers often ask for small upfront payments before releasing supposed funds, loans, or parcels.",
  },
  {
    id: "impersonation-authority",
    label: "Claims to be support, bank, courier, or authority needing action",
    pattern: anyOf(
      /\b(customer care|helpline|support team|bank security|customs department|delivery failed|parcel held|official notice)\b/,
      // Bangla
      /(কাস্টমার কেয়ার|হেল্পলাইন|সাপোর্ট টিম|ডেলিভারি ব্যর্থ|পার্সেল আটক|কাস্টমস বিভাগ)/
    ),
    score: 2,
    advice:
      "Anyone can claim to be support or an official in text or chat. Look up official contact numbers independently.",
  },
  {
    id: "personal-id-request",
    label: "Requests sensitive ID, card, or password details",
    negatable: true,
    pattern: anyOf(
      /\b(share|send|enter|provide|confirm)\b.{0,30}\b(nid|national id|passport|card number|cvv|password|date of birth)\b/,
      // Bangla: "এনআইডি নম্বর পাঠান", "কার্ড নম্বর দিন"
      /(এনআইডি|জাতীয় পরিচয়পত্র|পাসপোর্ট|কার্ড নম্বর|কার্ড নাম্বার|সিভিভি|জন্ম তারিখ).{0,25}(দিন|পাঠান|শেয়ার|জানান|বলুন)|(দিন|পাঠান|শেয়ার করুন|জানান|বলুন).{0,25}(এনআইডি|পাসপোর্ট|কার্ড নম্বর|সিভিভি)/,
      // Banglish
      /\b(nid|card number|cvv|passport)\b.{0,25}\b(din|den|pathan|dien|janan|bolun)\b/
    ),
    score: 4,
    advice:
      "Keep ID numbers, card details, and passwords private—especially on pages opened from unsolicited messages.",
  },
  {
    id: "urgency-pressure",
    label: "Uses strong urgency or countdown pressure to rush you",
    pattern: anyOf(
      /\b(urgent|urgently|immediately|within \d+ hours?|last chance|final warning|act now|expires in \d+)\b/,
      // Bangla: "এখনই", "২৪ ঘণ্টার মধ্যে"
      /(এখনই|এক্ষুনি|এক্ষুণি|অবিলম্বে|আজই|জরুরি|জরুরী|ঘণ্টার মধ্যে|ঘন্টার মধ্যে|শেষ সুযোগ)/,
      // Banglish
      /\b(ekhoni|ekhuni|ekkhuni|joruri|ghontar moddhe|ghontar vitore|shesh shujog|sesh shujog)\b/
    ),
    score: 2,
    advice:
      "Urgency is often used to rush decisions. Pause and verify before acting.",
  },
];
