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

function maskDigits(text: string): string {
  return text.replace(/\d{4,}/g, (m) => "\u2022".repeat(m.length));
}

function getRiskStyles(level: RiskLevel) {
  switch (level) {
    case "high":
      return {
        badge: "bg-rose-500/15 text-rose-700 border-rose-500/30",
        card: "border-rose-200/90 bg-gradient-to-b from-rose-50/80 to-white",
        meter: "bg-rose-600",
        meterWidth: "w-full",
        highlight:
          "bg-rose-200/80 text-rose-950 border-b-2 border-rose-500 rounded px-1 py-0.5 font-medium",
        label: "High Risk",
        summaryNote:
          "Multiple strong scam or phishing indicators were detected. Do not share OTPs/PINs, send money, or click unverified links.",
      };
    case "medium":
      return {
        badge: "bg-amber-500/15 text-amber-800 border-amber-500/30",
        card: "border-amber-200/90 bg-gradient-to-b from-amber-50/75 to-white",
        meter: "bg-amber-500",
        meterWidth: "w-2/3",
        highlight:
          "bg-amber-200/80 text-amber-950 border-b-2 border-amber-500 rounded px-1 py-0.5 font-medium",
        label: "Medium Risk",
        summaryNote:
          "Some caution signals or link anomalies appeared. Verify the sender independently before acting.",
      };
    default:
      return {
        badge: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30",
        card: "border-emerald-200/90 bg-gradient-to-b from-emerald-50/70 to-white",
        meter: "bg-emerald-600",
        meterWidth: "w-1/3",
        highlight:
          "bg-emerald-200/80 text-emerald-950 border-b-2 border-emerald-500 rounded px-1 py-0.5 font-medium",
        label: "Low Risk",
        summaryNote:
          "Few or no known scam patterns matched, but always stay cautious with unexpected requests or links.",
      };
  }
}

function formatSummary(result: AnalysisResult, levelLabel: string): string {
  const signalLines = result.hits.map(
    (h) => `- ${h.label} (+${h.score}): ${h.reason}`
  );
  const linkLines = result.links.map((l) => {
    const flagText = l.flags.length > 0 ? l.flags.join(", ") : "No link flags";
    return `- Link (${l.url} | +${l.score}): ${flagText}`;
  });

  const parts = [
    `Shotorko Check Result: ${levelLabel} (Total Score: ${result.total} | Message: +${result.ruleScore}, Links: +${result.linkScore})`,
    signalLines.length > 0 ? `Message Signals:\n${signalLines.join("\n")}` : "",
    linkLines.length > 0 ? `Link Analysis:\n${linkLines.join("\n")}` : "",
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

  function saveHistoryToStorage(items: HistoryItem[]) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }

  function recordHistory(rawText: string, analysis: AnalysisResult) {
    if (!historyEnabled) return;
    const cleaned = maskDigits(rawText.trim());
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
      saveHistoryToStorage(updated);
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

  function handleDeleteHistoryItem(id: string) {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistoryToStorage(updated);
      return updated;
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
      <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-indigo-50/40 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
                Shotorko • Client-Side Shield
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                Zero Server Upload • 4+ Digits Masked
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Check a Suspicious Message or Link
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Paste an SMS, chat message, email, or URL to inspect scam signals
              and risky links. Every check runs strictly inside your browser.
            </p>
          </header>

          <form
            onSubmit={handleCheck}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="message-input"
                className="block text-sm font-semibold text-slate-800"
              >
                Message or link text
              </label>
              <span className="text-xs font-medium text-slate-400">
                {message.length} chars
              </span>
            </div>

            <textarea
              id="message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste SMS, chat message, email, or link here..."
              className="mt-2.5 w-full rounded-xl border border-slate-300 bg-slate-50/80 p-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-600/10 focus:outline-none"
            />

            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick test samples
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample.text)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-900 cursor-pointer"
                  >
                    {sample.buttonLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 cursor-pointer"
                >
                  Check Message
                </button>
                {message && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <span className="text-xs font-medium text-slate-500">
                Processed locally in browser
              </span>
            </div>
          </form>

          {result && riskMeta && (
            <section
              aria-live="polite"
              className={`mt-6 rounded-2xl border p-5 shadow-xs sm:p-6 ${riskMeta.card}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${riskMeta.badge}`}
                  >
                    {riskMeta.label}
                  </span>
                  <h2 className="mt-2.5 text-lg font-bold text-slate-950">
                    {totalFindings > 0
                      ? `${totalFindings} finding${
                          totalFindings > 1 ? "s" : ""
                        } detected`
                      : "No common scam patterns matched"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-sm">
                    {riskMeta.summaryNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-right">
                    <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Total Score
                    </span>
                    <span className="text-base font-bold text-slate-950">
                      {result.total}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Summary"}
                  </button>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${riskMeta.meter} ${riskMeta.meterWidth}`}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl border border-slate-200/80 bg-white p-3 text-center sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50/70 p-2">
                  <p className="text-[11px] font-medium text-slate-500">
                    Message Signals
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    +{result.ruleScore}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50/70 p-2">
                  <p className="text-[11px] font-medium text-slate-500">
                    Link Checks
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    +{result.linkScore}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50/70 p-2">
                  <p className="text-[11px] font-medium text-slate-500">
                    Risk Scale
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-700">
                    0–1 Low • 2–4 Med • 5+ High
                  </p>
                </div>
              </div>

              {result.segments.length > 0 && (
                <div className="mt-5 rounded-xl border border-slate-200/90 bg-white p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Highlighted Text
                  </h3>
                  <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                    {result.segments.map((seg, idx) =>
                      seg.highlighted ? (
                        <mark
                          key={idx}
                          title={seg.ruleLabel}
                          className={riskMeta.highlight}
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
                    Message Signals &amp; Reasons ({result.hits.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.hits.map((hit) => (
                      <li
                        key={hit.id}
                        className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {hit.label}
                          </p>
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            +{hit.score}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">
                          Why it triggered: {hit.reason}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
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
                    Link Analysis ({result.links.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.links.map((link) => (
                      <li
                        key={link.url}
                        className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span className="break-all font-mono text-sm font-semibold text-slate-900">
                            {link.url}
                          </span>
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            +{link.score}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Domain: <span className="font-mono">{link.host}</span>{" "}
                          • Protocol:{" "}
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
                            No domain spelling, redirect, or phishing flags
                            triggered. Still verify the sender before opening.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {totalFindings === 0 && (
                <p className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 text-sm text-slate-700">
                  None of the current rule patterns or link checks triggered.
                  Still double-check the sender and avoid sharing sensitive codes
                  or money on unverified requests.
                </p>
              )}

              <p className="mt-5 rounded-xl border border-slate-200/70 bg-white/90 p-3.5 text-xs leading-relaxed text-slate-600">
                This is not a final verdict—even a low-risk result does not
                guarantee a message is safe. If you are unsure, contact the
                organization through its official website or phone number.
              </p>
            </section>
          )}

          <section className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-950">
                  Recent Checks (Browser Only)
                </h2>
                <p className="text-xs text-slate-500">
                  Saved only in your browser&apos;s local storage with 4+
                  digits masked—never sent to a server.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleHistory}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                >
                  {historyEnabled ? "Saving: On" : "Saving: Off"}
                </button>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                  >
                    Clear All
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
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadHistoryItem(item)}
                        className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 text-left group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1 pr-1">
                          <p className="truncate text-sm font-medium text-slate-800 group-hover:text-indigo-700">
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

                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        aria-label="Remove history item"
                        title="Remove from browser history"
                        className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
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