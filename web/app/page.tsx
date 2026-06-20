"use client";

import { useState, useEffect, useCallback } from "react";

type Item = { id: string; type: string; title: string; body: string };
type Proposal = { type: string; title: string; body: string; confidence: number };
type CodeCite = { path: string; startLine: number; endLine: number; symbol?: string | null };
type AskResult = { contextItems: Item[]; codeCitations: CodeCite[]; answer: string | null; grounded: boolean };

const TYPES = ["convention", "decision", "glossary", "note"];

export default function Home() {
  const [wsId, setWsId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [claudeMd, setClaudeMd] = useState("");
  const [error, setError] = useState("");

  // add-context form
  const [type, setType] = useState("convention");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // extract
  const [extractText, setExtractText] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // codebase + ask
  const [codeStats, setCodeStats] = useState<{ files: number; chunks: number } | null>(null);
  const [question, setQuestion] = useState("how is money stored for an order?");
  const [ask, setAsk] = useState<AskResult | null>(null);
  const [busy, setBusy] = useState("");

  const applyState = (d: { items: Item[]; files: Record<string, string> }) => {
    setItems(d.items);
    setClaudeMd(d.files["CLAUDE.md"]);
  };

  const init = useCallback(async () => {
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project: "my-team", seed: true }),
    });
    const d = await res.json();
    setWsId(d.workspaceId);
    applyState(d);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  async function addContext() {
    if (!title.trim() || !body.trim()) return;
    setError("");
    const res = await fetch("/api/context", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId: wsId, type, title, body }),
    });
    const d = await res.json();
    if (!res.ok) return setError(d.error?.message ?? "Failed");
    applyState(d);
    setTitle("");
    setBody("");
  }

  async function runExtract() {
    setError("");
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: extractText }),
    });
    const d = await res.json();
    if (!res.ok) return setError(d.error?.message ?? "Failed");
    setProposals(d.proposals);
  }

  async function acceptProposal(p: Proposal) {
    const res = await fetch("/api/context", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId: wsId, type: p.type, title: p.title, body: p.body }),
    });
    const d = await res.json();
    if (res.ok) {
      applyState(d);
      setProposals((ps) => ps.filter((x) => x !== p));
    }
  }

  async function uploadCode(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy("index");
    const form = new FormData();
    form.append("workspaceId", wsId);
    form.append("repo", file);
    const res = await fetch("/api/index-code", { method: "POST", body: form });
    const d = await res.json();
    setBusy("");
    if (!res.ok) return setError(d.error?.message ?? "Indexing failed");
    setCodeStats(d);
  }

  async function runAsk() {
    setError("");
    setBusy("ask");
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId: wsId, question }),
    });
    const d = await res.json();
    setBusy("");
    if (!res.ok) return setError(d.error?.message ?? "Ask failed");
    setAsk(d);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">ContextOS</h1>
      <p className="mt-2 text-zinc-500">
        Your team&apos;s durable context — decisions, conventions, glossary — captured once and loaded by every AI tool
        so sessions start <em>warm</em>. Export the Context Handoff, or ask questions grounded in your context + code.
      </p>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {/* CONTEXT */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Team context ({items.length})</h2>
        <div className="mt-3 divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {items.map((i) => (
            <div key={i.id} className="px-3 py-2 text-sm">
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {i.type}
              </span>{" "}
              <span className="font-medium">{i.title}</span>
              <span className="text-zinc-500"> — {i.body}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="title" className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="body" className="flex-[2] rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <button onClick={addContext} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
            Add
          </button>
        </div>
      </section>

      {/* EXTRACT */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Capture from text</h2>
        <p className="text-sm text-zinc-500">Paste a PR description, chat, or notes — extract candidate decisions/conventions.</p>
        <textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} rows={4} className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="We decided to use idempotency keys. Convention: never log raw card numbers." />
        <button onClick={runExtract} className="mt-2 rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700">Extract proposals</button>
        {proposals.length > 0 && (
          <div className="mt-3 space-y-2">
            {proposals.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
                <span><span className="text-xs text-zinc-500">[{p.type} · {p.confidence}]</span> {p.title}</span>
                <button onClick={() => acceptProposal(p)} className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white">Accept</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HANDOFF */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Context Handoff</h2>
        <div className="mt-2 flex gap-2">
          <a href={`/api/export?workspaceId=${wsId}`} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">Download bundle (.json)</a>
        </div>
        <p className="mt-3 text-sm text-zinc-500">Generated <code>CLAUDE.md</code> (what a fresh AI session loads):</p>
        <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">{claudeMd}</pre>
      </section>

      {/* GROUNDED ASK */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Ask (grounded in context + code)</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">Optionally upload a .zip of your repo:</span>
          <input type="file" accept=".zip" onChange={uploadCode} disabled={busy === "index"} className="text-xs" />
          {codeStats && <span className="text-sm text-emerald-600">✓ {codeStats.files} files / {codeStats.chunks} chunks</span>}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runAsk()} className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="how does X work here?" />
          <button onClick={runAsk} disabled={busy === "ask"} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black">{busy === "ask" ? "…" : "Ask"}</button>
        </div>
        {ask && (
          <div className="mt-3 space-y-3 text-sm">
            {ask.grounded && (
              <div className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                <div className="mb-1 text-xs font-medium text-zinc-500">Answer</div>
                <div className="whitespace-pre-wrap">{ask.answer}</div>
              </div>
            )}
            {!ask.grounded && <p className="text-xs text-zinc-400">Retrieval-only (no LLM key). Showing relevant context + code; set ANTHROPIC_API_KEY for a written answer.</p>}
            {ask.contextItems.length > 0 && (
              <div>
                <div className="text-xs font-medium text-zinc-500">Relevant team context</div>
                {ask.contextItems.map((i) => (
                  <div key={i.id} className="mt-1 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500">[{i.type}]</span> <span className="font-medium">{i.title}</span> — {i.body}
                  </div>
                ))}
              </div>
            )}
            {ask.codeCitations.length > 0 && (
              <div>
                <div className="text-xs font-medium text-zinc-500">Code evidence</div>
                {ask.codeCitations.map((c) => (
                  <div key={`${c.path}:${c.startLine}`} className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    {c.path}:{c.startLine}-{c.endLine}{c.symbol ? ` · ${c.symbol}` : ""}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
