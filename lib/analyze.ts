import { analyzeLinks, type LinkFinding } from "./links";
import { rules, type RiskLevel, type Rule } from "./rules";

export type MatchedRule = Rule & {
  matchedText: string;
  reason: string;
};

export type HighlightSegment = {
  text: string;
  highlighted: boolean;
  ruleLabel?: string;
};

export type RiskReasonItem = {
  id: string;
  source: "message" | "link";
  title: string;
  reason: string;
  advice?: string;
  score: number;
};

export type AnalysisResult = {
  hits: MatchedRule[];
  links: LinkFinding[];
  reasons: RiskReasonItem[];
  segments: HighlightSegment[];
  ruleScore: number;
  linkScore: number;
  total: number;
  level: RiskLevel;
};

type Span = {
  start: number;
  end: number;
  label: string;
};

function buildSegments(text: string, spans: Span[]): HighlightSegment[] {
  if (!text) return [];
  if (spans.length === 0) {
    return [{ text, highlighted: false }];
  }

  const sorted = [...spans].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });

  const merged: Span[] = [];
  for (const span of sorted) {
    const last = merged[merged.length - 1];
    if (!last || span.start >= last.end) {
      merged.push({ ...span });
    } else if (span.end > last.end) {
      last.end = span.end;
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const span of merged) {
    if (span.start > cursor) {
      segments.push({
        text: text.slice(cursor, span.start),
        highlighted: false,
      });
    }
    segments.push({
      text: text.slice(span.start, span.end),
      highlighted: true,
      ruleLabel: span.label,
    });
    cursor = span.end;
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlighted: false,
    });
  }

  return segments;
}

export function analyze(text: string): AnalysisResult {
  const cleaned = text.trim();
  if (!cleaned) {
    return {
      hits: [],
      links: [],
      reasons: [],
      segments: [],
      ruleScore: 0,
      linkScore: 0,
      total: 0,
      level: "low",
    };
  }

  const hits: MatchedRule[] = [];
  const spans: Span[] = [];
  const reasons: RiskReasonItem[] = [];

  for (const rule of rules) {
    const flags = rule.pattern.flags.includes("g")
      ? rule.pattern.flags
      : `${rule.pattern.flags}g`;
    const globalRegex = new RegExp(rule.pattern.source, flags);

    let match: RegExpExecArray | null;
    let firstMatchedText = "";

    while ((match = globalRegex.exec(cleaned)) !== null) {
      if (!match[0]) {
        globalRegex.lastIndex++;
        continue;
      }
      if (!firstMatchedText) {
        firstMatchedText = match[0];
      }
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        label: rule.label,
      });
    }

    if (firstMatchedText) {
      const reason = `Matched "${firstMatchedText}" under ${rule.label.toLowerCase()}.`;
      hits.push({
        ...rule,
        matchedText: firstMatchedText,
        reason,
      });
      reasons.push({
        id: `rule-${rule.id}`,
        source: "message",
        title: rule.label,
        reason,
        advice: rule.advice,
        score: rule.score,
      });
    }
  }

  const { links, linkScore } = analyzeLinks(cleaned);
  for (const link of links) {
    const idx = cleaned.toLowerCase().indexOf(link.url.toLowerCase());
    if (idx !== -1) {
      spans.push({
        start: idx,
        end: idx + link.url.length,
        label:
          link.flags.length > 0
            ? `Detected link (${link.flags.join("; ")})`
            : "Detected link",
      });
    }

    if (link.flags.length > 0) {
      reasons.push({
        id: `link-${link.url}`,
        source: "link",
        title: `Link check: ${link.host}`,
        reason: link.flags.join(". "),
        advice:
          "Avoid opening links from unverified messages; navigate to the official site manually.",
        score: link.score,
      });
    }
  }

  const ruleScore = hits.reduce((sum, rule) => sum + rule.score, 0);
  const total = ruleScore + linkScore;

  let level: RiskLevel = "low";
  if (total >= 5) {
    level = "high";
  } else if (total >= 2) {
    level = "medium";
  }

  const segments = buildSegments(cleaned, spans);

  return {
    hits,
    links,
    reasons,
    segments,
    ruleScore,
    linkScore,
    total,
    level,
  };
}