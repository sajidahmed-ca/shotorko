"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { analyze, type AnalysisResult } from "@/lib/analyze";
import { PRESET_SAMPLES } from "@/lib/presets";
import type { RiskLevel } from "@/lib/rules";

type HistoryItem = {
  id: string;
  checkedAt: string;
  preview: string;
  fullText: string;
  level: RiskLevel;
  total: number;
  findingsCount: number;
};

const HISTORY_STORAGE_KEY = "shotorko_recent_checks_v1";
const HISTORY_ENABLED_KEY = "shotorko_history_enabled_v1";
const MAX_HISTORY_ITEMS = 6;

function getRiskStyles(level: RiskLevel) {
  switch (level) {
    case "high":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        card: "border-red-200 bg-red-50/50",
        highlight: "bg-red-200/80 text-red-950 border-b-2 border-red-500",
        label: "High Risk",
      };
    case "medium":
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        card: "border-amber-200 bg-amber-50/50",
        highlight: "bg-amber-200/80 text-amber-950 border-b-2 border-amber-500",
        label: "Medium Risk",
      };
    default:
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        card: "border-emerald-200 bg-emerald-50/50",
        highlight:
          "bg-emerald-200/80 text-emerald-950 border-b-2 border-emerald-500",
        label: "Low Risk",
      };
  }
}

function formatSummary(result: AnalysisResult, levelLabel: string): string {
  const signalLines = result.hits.map(
    (h) => `- ${h.label} (+${h.score}): ${h.advice}`
  );
  const linkLines = result.links.map((l) => {
    const flagText = l.flags.length > 0 ? l.flags.join(", ") : "No link flags";
    return `- Link (${l.url}): ${flagText}`;
  });

  const parts = [
    `Shotorko Check Result: ${levelLabel} (Score: ${result.total})`,
    signalLines.length > 0 ? `Signals:\n${signalLines.join("\n")}` : "",
    linkLines.length > 0 ? `Links:\n${linkLines.join("\n")}` : "",
    "Note: This is not a final verdict. Always verify through official channels.",
  ].filter(Boolean);

  return parts.join("\n\n");
}

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const savedEnabled = localStorage.getItem(HISTORY_ENABLED_KEY);
      if (savedEnabled !== null) {
        setHistoryEnabled(savedEnabled === "true");
      }
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory) as HistoryItem[];
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Ignore storage access errors in restricted browser modes
    }
  }, []);

  function recordHistory(rawText: string, analysis: AnalysisResult) {
    if (!historyEnabled) return;
    const cleaned = rawText.trim();
    if (!cleaned) return;

    const preview =
      cleaned.length > 90 ? `${cleaned.slice(0, 90).trim()}...` : cleaned;
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      checkedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      preview,
      fullText: cleaned,
      level: analysis.level,
      total: analysis.total,
      findingsCount: analysis.hits.length + analysis.links.length,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  }

  function runAnalysis(rawText: string) {
    const analysis = analyze(rawText);
    setResult(analysis);
    setCopied(false);
    recordHistory(rawText, analysis);
  }

  function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    runAnalysis(message);
  }

  function handleClear() {
    setMessage("");
    setResult(null);
    setCopied(false);
  }

  function handleSelectPreset(sampleText: string) {
    setMessage(sampleText);
    runAnalysis(sampleText);
  }

  async function handleCopySummary() {
    if (!result) return;
    const levelLabel = getRiskStyles(result.level).label;
    const summary = formatSummary(result, levelLabel);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleToggleHistory() {
    setHistoryEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HISTORY_ENABLED_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }

  function handleClearHistory() {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  function handleLoadHistoryItem(item: HistoryItem) {
    setMessage(item.fullText);
    setResult(analyze(item.fullText));
    setCopied(false);
  }

  const riskMeta = result ? getRiskStyles(result.level) : null;
  const totalFindings = result ? result.hits.length + result.links.length : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <header className="mb-8">
            <p className="text-sm font-medium text-slate-500">
              Shotorko • Browser-Only Scam Check
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Check a Suspicious Message or Link
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Paste a message below to spot common scam signals. Nothing you paste
              is sent to a server—all checks run locally in your browser.
            </p>
          </header>

          <form
            onSubmit={handleCheck}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
          >
            <label
              htmlFor="message-input"
              className="block text-sm font-semibold text-slate-800"
            >
              Message or link text
            </label>
            <textarea
              id="message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste SMS, chat message, email, or link here..."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />

            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Quick test samples:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample.text)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
                  >
                    {sample.buttonLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                >
                  Check Message
                </button>
                {message && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-500">
                Processed locally in browser
              </span>
            </div>
          </form>

          {result && riskMeta && (
            <section
              aria-live="polite"
              className={`mt-6 rounded-2xl border p-6 ${riskMeta.card}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${riskMeta.badge}`}
                  >
                    {riskMeta.label}
                  </span>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    {totalFindings > 0
                      ? `${totalFindings} finding${
                          totalFindings > 1 ? "s" : ""
                        } detected`
                      : "No common scam patterns matched"}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    Risk score:{" "}
                    <span className="font-semibold">{result.total}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? "Copied" : "Copy Summary"}
                  </button>
                </div>
              </div>

              {result.segments.length > 0 && (
                <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Highlighted Text
                  </h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                    {result.segments.map((seg, idx) =>
                      seg.highlighted ? (
                        <mark
                          key={idx}
                          title={seg.ruleLabel}
                          className={`rounded px-1 py-0.5 font-medium ${riskMeta.highlight}`}
                        >
                          {seg.text}
                        </mark>
                      ) : (
                        <span key={idx}>{seg.text}</span>
                      )
                    )}
                  </p>
                </div>
              )}

              {result.hits.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message Signals ({result.hits.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.hits.map((hit) => (
                      <li
                        key={hit.id}
                        className="rounded-xl border border-slate-200/80 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {hit.label}
                          </p>
                          <span className="text-xs font-medium text-slate-500">
                            +{hit.score}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Matched phrase:{" "}
                          <span className="font-mono font-medium text-slate-700">
                            &ldquo;{hit.matchedText}&rdquo;
                          </span>
                        </p>
                        <p className="mt-1.5 text-sm text-slate-600">
                          {hit.advice}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.links.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Detected Links ({result.links.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.links.map((link) => (
                      <li
                        key={link.url}
                        className="rounded-xl border border-slate-200/80 bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="break-all font-mono text-sm font-semibold text-slate-900">
                            {link.url}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            +{link.score}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Host: <span className="font-mono">{link.host}</span> •
                          Protocol:{" "}
                          <span className="uppercase">{link.protocol}</span>
                        </p>
                        {link.flags.length > 0 ? (
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                            {link.flags.map((flag) => (
                              <li key={flag}>{flag}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-xs text-slate-600">
                            No obvious link anomalies flagged by current checks.
                            Still verify the sender before opening.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalFindings === 0 && (
                <p className="mt-4 rounded-xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700">
                  None of the current rule patterns triggered. Still
                  double-check the sender and avoid sharing sensitive codes or
                  money on unverified requests.
                </p>
              )}

              <p className="mt-5 rounded-xl bg-white/80 p-3.5 text-xs leading-relaxed text-slate-600">
                This is not a final verdict—even a low-risk result does not
                guarantee a message is safe. If you are unsure, contact the
                organization through its official website or phone number.
              </p>
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Checks (Browser Only)
                </h2>
                <p className="text-xs text-slate-500">
                  Saved only in your browser&apos;s local storage—never sent to
                  a server.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleHistory}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  {historyEnabled ? "Saving: On" : "Saving: Off"}
                </button>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {!historyEnabled ? (
              <p className="mt-4 text-sm text-slate-500">
                History saving is turned off.
              </p>
            ) : history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No recent checks yet. Checked messages will appear here.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {history.map((item) => {
                  const badgeStyle = getRiskStyles(item.level).badge;
                  return (
                    <li key={item.id} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => handleLoadHistoryItem(item)}
                        className="flex w-full items-center justify-between gap-3 text-left group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800 group-hover:text-slate-950">
                            {item.preview}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.checkedAt} • {item.findingsCount} finding
                            {item.findingsCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
                        >
                          {getRiskStyles(item.level).label} ({item.total})
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}