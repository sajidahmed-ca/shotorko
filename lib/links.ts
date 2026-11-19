export type LinkFinding = {
  url: string;
  host: string;
  protocol: string;
  flags: string[];
  score: number;
};

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rb.gy",
  "cutt.ly",
  "tiny.cc",
]);

const MESSAGING_REDIRECT_HOSTS = new Set([
  "t.me",
  "telegram.me",
  "wa.me",
  "api.whatsapp.com",
]);

const RISKY_TLDS = new Set([
  "xyz",
  "top",
  "click",
  "icu",
  "rest",
  "gq",
  "tk",
  "ml",
  "ga",
  "cf",
  "zip",
  "mov",
]);

const DECOY_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "update",
  "secure",
  "account",
  "wallet",
  "claim",
  "reward",
  "bonus",
  "kyc",
  "support",
];

const URL_REGEX =
  /\b((?:https?:\/\/|www\.)[^\s<>"')\]]+|[a-z0-9-]+(?:\.[a-z0-9-]+)+\.(?:com|net|org|io|co|bd|xyz|top|click|icu|rest|gq|tk|ml|ga|cf|zip|mov|me|ly)(?:\/[^\s<>"')\]]*)?)/gi;

function cleanTrailingPunctuation(raw: string): string {
  return raw.replace(/[.,!?;:]+$/g, "");
}

function normalizeUrl(raw: string): URL | null {
  const cleaned = cleanTrailingPunctuation(raw.trim());
  if (!cleaned) return null;

  const withScheme = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : `http://${cleaned}`;

  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function isIpv4(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

export function analyzeLinks(text: string): {
  links: LinkFinding[];
  linkScore: number;
} {
  const matches = text.match(URL_REGEX) ?? [];
  const seen = new Set<string>();
  const links: LinkFinding[] = [];

  for (const rawMatch of matches) {
    const cleaned = cleanTrailingPunctuation(rawMatch);
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const parsed = normalizeUrl(cleaned);
    if (!parsed) continue;

    const host = parsed.hostname.toLowerCase();
    const fullLower = cleaned.toLowerCase();
    const hadExplicitHttp = /^http:\/\//i.test(cleaned);
    const hadExplicitHttps = /^https:\/\//i.test(cleaned);
    const protocol = hadExplicitHttps
      ? "https"
      : hadExplicitHttp
        ? "http"
        : "unspecified";

    const flags: string[] = [];
    let score = 0;

    if (hadExplicitHttp) {
      flags.push("Uses unencrypted HTTP instead of HTTPS");
      score += 2;
    }

    if (SHORTENER_HOSTS.has(host)) {
      flags.push("Uses a link shortener that hides the final destination");
      score += 2;
    }

    if (MESSAGING_REDIRECT_HOSTS.has(host)) {
      flags.push("Points to a messaging or chat redirect link");
      score += 2;
    }

    if (isIpv4(host)) {
      flags.push("Uses a raw IP address instead of a domain name");
      score += 3;
    }

    if (cleaned.includes("@")) {
      flags.push(
        "Contains '@' in the URL, which can obscure the real destination host"
      );
      score += 3;
    }

    const parts = host.split(".");
    const tld = parts.length > 1 ? parts[parts.length - 1] : "";
    if (tld && RISKY_TLDS.has(tld)) {
      flags.push(`Uses a high-abuse top-level domain (.${tld})`);
      score += 2;
    }

    if (parts.length >= 4 && !isIpv4(host)) {
      flags.push("Has many subdomains, which can mimic legitimate websites");
      score += 1;
    }

    const hyphenCount = (host.match(/-/g) ?? []).length;
    if (hyphenCount >= 2) {
      flags.push("Domain contains multiple hyphens, common in lookalike domains");
      score += 1;
    }

    const matchedDecoys = DECOY_KEYWORDS.filter((word) =>
      fullLower.includes(word)
    );
    if (matchedDecoys.length > 0) {
      flags.push(
        `Contains high-attention keywords in URL (${matchedDecoys.join(", ")})`
      );
      score += 1;
    }

    if (host.includes("xn--")) {
      flags.push(
        "Contains punycode characters that may imitate another character set"
      );
      score += 2;
    }

    links.push({
      url: cleaned,
      host,
      protocol,
      flags,
      score,
    });
  }

  const linkScore = links.reduce((sum, item) => sum + item.score, 0);
  return { links, linkScore };
}