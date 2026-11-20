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
        badge:
          "bg-rose-500/12 text-rose-700 border-rose-500/30 ring-1 ring-inset ring-rose-500/15",
        card: "border-rose-200/90 bg-white shadow-[0_14px_34px_-14px_rgba(225,29,72,0.18)]",
        topAccent: "from-rose-500 via-red-500 to-amber-500",
        meter: "bg-gradient-to-r from-rose-500 to-red-600",
        meterWidth: "w-full",
        highlight:
          "bg-rose-100/95 text-rose-950 border-b-2 border-rose-500 rounded-md px-1.5 py-0.5 font-medium shadow-[0_1px_0_rgba(244,63,94,0.2)]",
        label: "High Risk",
        summaryNote:
          "Multiple strong scam or phishing indicators were detected. Do not share OTPs/PINs, send money, or click unverified links.",
      };
    case "medium":
      return {
        badge:
          "bg-amber-500/15 text-amber-800 border-amber-500/30 ring-1 ring-inset ring-amber-500/15",
        card: "border-amber-200/90 bg-white shadow-[0_14px_34px_-14px_rgba(217,119,6,0.18)]",
        topAccent: "from-amber-400 via-amber-500 to-orange-500",
        meter: "bg-gradient-to-r from-amber-400 to-amber-600",
        meterWidth: "w-2/3",
        highlight:
          "bg-amber-100/95 text-amber-950 border-b-2 border-amber-500 rounded-md px-1.5 py-0.5 font-medium shadow-[0_1px_0_rgba(245,158,11,0.2)]",
        label: "Medium Risk",
        summaryNote:
          "Some caution signals or link anomalies appeared. Verify the sender independently before acting.",
      };
    default:
      return {
        badge:
          "bg-emerald-500/12 text-emerald-800 border-emerald-500/30 ring-1 ring-inset ring-emerald-500/15",
        card: "border-emerald-200/90 bg-white shadow-[0_14px_34px_-14px_rgba(5,150,105,0.16)]",
        topAccent: "from-emerald-500 via-teal-500 to-indigo-500",
        meter: "bg-gradient-to-r from-emerald-500 to-teal-600",
        meterWidth: "w-1/3",
        highlight:
          "bg-emerald-100/95 text-emerald-950 border-b-2 border-emerald-500 rounded-md px-1.5 py-0.5 font-medium shadow-[0_1px_0_rgba(16,185,129,0.2)]",
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
      <main className="shotorko-grid-bg min-h-screen text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          {/* Hero Header Card */}
          <header className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_30px_-16px_rgba(15,23,42,0.14)] sm:p-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 via-violet-500 to-sky-500" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-semibold text-indigo-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Shotorko • Browser-Only Shield
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-600">
                100% Local • Digits Masked
              </span>
            </div>
            <h1 className="font-display mt-3.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Check a Suspicious Message or Link
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Paste an SMS, chat message, email, or URL to spot scam signals and
              risky links. Nothing leaves your device—every rule and link check
              runs locally in your browser.
            </p>
          </header>

          {/* Scanner Input Card */}
          <form
            onSubmit={handleCheck}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_30px_-16px_rgba(15,23,42,0.12)] sm:p-6"
          >
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="message-input"
                className="block text-sm font-semibold text-slate-900"
              >
                Message or link text
              </label>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500 tabular-nums">
                {message.length} chars
              </span>
            </div>

            <textarea
              id="message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste SMS, chat message, email, or link here..."
              className="mt-2.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-inner transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 focus:outline-none"
            />

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick test samples
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample.text)}
                    className="rounded-lg border border-slate-200/90 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-900 cursor-pointer"
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
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.65)] transition hover:from-indigo-700 hover:to-violet-700 active:translate-y-px cursor-pointer"
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

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Processed locally in browser
              </span>
            </div>
          </form>

          {/* Analysis Results Card */}
          {result && riskMeta && (
            <section
              aria-live="polite"
              className={`relative mt-7 overflow-hidden rounded-2xl border p-5 sm:p-6 ${riskMeta.card}`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${riskMeta.topAccent}`}
              />

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${riskMeta.badge}`}
                  >
                    {riskMeta.label}
                  </span>
                  <h2 className="font-display mt-2.5 text-lg font-bold text-slate-950 sm:text-xl">
                    {totalFindings > 0
                      ? `${totalFindings} finding${
                          totalFindings > 1 ? "s" : ""
                        } detected`
                      : "No common scam patterns matched"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {riskMeta.summaryNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-1.5 text-right">
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Total Score
                    </span>
                    <span className="font-mono text-base font-bold text-slate-950 tabular-nums">
                      {result.total}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Summary"}
                  </button>
                </div>
              </div>

              {/* Risk Meter */}
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${riskMeta.meter} ${riskMeta.meterWidth}`}
                />
              </div>

              {/* Score Breakdown Grid */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Message Signals
                  </p>
                  <p className="font-mono mt-1 text-base font-bold text-slate-950 tabular-nums">
                    +{result.ruleScore}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Link Checks
                  </p>
                  <p className="font-mono mt-1 text-base font-bold text-slate-950 tabular-nums">
                    +{result.linkScore}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/75 p-3 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Risk Scale
                  </p>
                  <p className="font-mono mt-1 text-xs font-semibold text-slate-700">
                    0–1 Low • 2–4 Med • 5+ High
                  </p>
                </div>
              </div>

              {/* Highlighted Text */}
              {result.segments.length > 0 && (
                <div className="mt-5 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
                  <h3 className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
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

              {/* Message Signals */}
              {result.hits.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Message Signals &amp; Reasons ({result.hits.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.hits.map((hit) => (
                      <li
                        key={hit.id}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-900">
                            {hit.label}
                          </p>
                          <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                            +{hit.score}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Why it triggered:
                          </span>{" "}
                          {hit.reason}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                          {hit.advice}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link Analysis */}
              {result.links.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Link Analysis ({result.links.length})
                  </h3>
                  <ul className="space-y-3">
                    {result.links.map((link) => (
                      <li
                        key={link.url}
                        className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span className="break-all font-mono text-sm font-semibold text-slate-950">
                            {link.url}
                          </span>
                          <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 tabular-nums">
                            +{link.score}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          Domain: {link.host} • Protocol:{" "}
                          <span className="uppercase">{link.protocol}</span>
                        </p>
                        {link.flags.length > 0 ? (
                          <ul className="mt-2.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
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
                <p className="mt-4 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 text-sm text-slate-700">
                  None of the current rule patterns or link checks triggered.
                  Still double-check the sender and avoid sharing sensitive codes
                  or money on unverified requests.
                </p>
              )}

              <p className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/90 p-3.5 text-xs leading-relaxed text-slate-600">
                This is not a final verdict—even a low-risk result does not
                guarantee a message is safe. If you are unsure, contact the
                organization through its official website or phone number.
              </p>
            </section>
          )}

          {/* Recent Checks History */}
          <section className="mt-7 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_12px_30px_-16px_rgba(15,23,42,0.12)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-950">
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
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/60 cursor-pointer"
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
              <ul className="mt-4 space-y-2">
                {history.map((item) => {
                  const badgeStyle = getRiskStyles(item.level).badge;
                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2.5 transition hover:border-slate-300 hover:bg-white"
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
                          <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                            {item.checkedAt} • {item.findingsCount} finding
                            {item.findingsCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${badgeStyle}`}
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