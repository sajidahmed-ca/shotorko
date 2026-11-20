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
  "shorturl.at",
  "rebrand.ly",
]);

const MESSAGING_REDIRECT_HOSTS = new Set([
  "t.me",
  "telegram.me",
  "wa.me",
  "api.whatsapp.com",
  "chat.whatsapp.com",
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
  "buzz",
  "shop",
  "loan",
]);

const BRAND_TARGETS = [
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "pathao",
  "google",
  "gmail",
  "facebook",
  "meta",
  "instagram",
  "whatsapp",
  "telegram",
  "apple",
  "icloud",
  "microsoft",
  "amazon",
  "paypal",
];

const PHISHING_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "verification",
  "update",
  "secure",
  "security",
  "account",
  "wallet",
  "claim",
  "reward",
  "bonus",
  "kyc",
  "support",
  "unlock",
  "suspend",
  "suspended",
  "confirm",
  "refund",
  "free",
  "gift",
  "apk",
];

const REDIRECT_PARAM_KEYS = new Set([
  "url",
  "redirect",
  "redirect_url",
  "redirect_uri",
  "next",
  "goto",
  "return",
  "return_url",
  "target",
  "dest",
  "destination",
  "out",
  "link",
]);

const URL_REGEX =
  /\b((?:https?:\/\/|www\.)[^\s<>"')\]]+|[a-z0-9-]+(?:\.[a-z0-9-]+)+\.(?:com|net|org|io|co|bd|xyz|top|click|icu|rest|gq|tk|ml|ga|cf|zip|mov|buzz|shop|loan|me|ly|app|site)(?:\/[^\s<>"')\]]*)?)/gi;

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

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function getBaseDomainLabel(host: string): string {
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 1) return host;
  // Handle common second-level domains like example.com.bd or example.co.uk
  const last = parts[parts.length - 1];
  const secondLast = parts[parts.length - 2];
  if (
    parts.length >= 3 &&
    last.length === 2 &&
    ["com", "net", "org", "co", "gov", "edu"].includes(secondLast)
  ) {
    return parts[parts.length - 3];
  }
  return parts[parts.length - 2];
}

function detectSuspiciousSpelling(host: string): string | null {
  const label = getBaseDomainLabel(host);
  const leetNormalized = label
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t");

  for (const brand of BRAND_TARGETS) {
    // Exact brand name as main domain label is normal; lookalikes modify it
    if (label === brand) continue;

    if (
      leetNormalized.includes(brand) ||
      label.includes(brand) ||
      brand.includes(label)
    ) {
      return `Domain label "${label}" resembles or includes "${brand}"`;
    }

    const maxDist = brand.length >= 6 ? 2 : 1;
    if (
      Math.abs(label.length - brand.length) <= maxDist &&
      levenshteinDistance(label, brand) <= maxDist
    ) {
      return `Domain label "${label}" has a spelling close to "${brand}"`;
    }
  }

  return null;
}

function detectRedirectSignal(parsed: URL, rawUrl: string): string | null {
  for (const [key, value] of parsed.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    const lowerVal = value.trim().toLowerCase();
    if (
      REDIRECT_PARAM_KEYS.has(lowerKey) ||
      /^https?:\/\//i.test(value.trim()) ||
      lowerVal.startsWith("//")
    ) {
      return `Contains redirect-like parameter "${key}" pointing to another destination`;
    }
  }

  const decodedPath = decodeURIComponent(parsed.pathname).toLowerCase();
  if (
    decodedPath.includes("http://") ||
    decodedPath.includes("https://") ||
    /\/redirect|\/redir|\/goto|\/out\b/i.test(decodedPath)
  ) {
    return "URL path appears to chain or forward to another address";
  }

  if (/https?:\/\/.*https?:\/\//i.test(rawUrl)) {
    return "Contains multiple embedded web addresses inside one link";
  }

  return null;
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

    const spellingFlag = detectSuspiciousSpelling(host);
    if (spellingFlag) {
      flags.push(spellingFlag);
      score += 3;
    }

    const redirectFlag = detectRedirectSignal(parsed, cleaned);
    if (redirectFlag) {
      flags.push(redirectFlag);
      score += 2;
    }

    const matchedKeywords = PHISHING_KEYWORDS.filter((word) =>
      fullLower.includes(word)
    );
    if (matchedKeywords.length > 0) {
      flags.push(
        `Contains phishing-style terms (${matchedKeywords.slice(0, 5).join(", ")})`
      );
      score += 1;
    }

    if (cleaned.length > 100) {
      flags.push("Unusually long URL often used to hide tracking or parameters");
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