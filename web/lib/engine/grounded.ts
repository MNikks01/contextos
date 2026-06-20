// GENERATED from engine/src/grounded.ts — DO NOT EDIT.
// Source of truth: engine/src. Regenerate: node engine/scripts/sync-to-web.mjs

// The wedge composition: answer a question grounded in BOTH the team's curated context
// (decisions/conventions/glossary) AND the actual code (via the vendored #2 retrieval
// engine). Citations point to context items and to code file:line. This is what no single
// AI tool does — it fuses institutional memory with the codebase.

import { CodebaseIndex } from "./codebase/index";
import { pickAnswerProvider } from "./codebase/answer";
import { tokenize } from "./codebase/tokenize";
import type { FileDoc } from "./codebase/types";
import { ContextStore } from "./store";
import type { ContextItem } from "./types";

export interface GroundedCodeCitation {
  path: string;
  startLine: number;
  endLine: number;
  symbol?: string;
  snippet: string;
}

export interface GroundedResult {
  question: string;
  contextItems: ContextItem[]; // relevant team decisions/conventions
  codeCitations: GroundedCodeCitation[]; // relevant code, file:line
  answer?: string; // present only with an LLM key
  grounded: boolean;
}

export class GroundedContext {
  private store: ContextStore;
  private code = new CodebaseIndex();
  private hasCode = false;

  constructor(store: ContextStore) {
    this.store = store;
  }

  async indexCode(docs: FileDoc[]): Promise<{ files: number; chunks: number }> {
    const stats = await this.code.indexDocs(docs);
    this.hasCode = true;
    return stats;
  }

  // Lexical relevance of context items to the question (token overlap on title+body).
  relevantContext(question: string, k = 3): ContextItem[] {
    const q = new Set(tokenize(question));
    return this.store
      .active()
      .map((item) => {
        const toks = new Set(tokenize(`${item.title} ${item.body} ${item.tags.join(" ")}`));
        let overlap = 0;
        for (const t of q) if (toks.has(t)) overlap++;
        return { item, overlap };
      })
      .filter((s) => s.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, k)
      .map((s) => s.item);
  }

  async ask(question: string, k = 6): Promise<GroundedResult> {
    const chunks = this.hasCode ? await this.code.search(question, k) : [];
    const contextItems = this.relevantContext(question);
    const codeCitations: GroundedCodeCitation[] = chunks.map((c) => ({
      path: c.path,
      startLine: c.startLine,
      endLine: c.endLine,
      symbol: c.symbol,
      snippet: c.content.split("\n").slice(0, 16).join("\n"),
    }));

    const provider = pickAnswerProvider();
    if (!provider || (chunks.length === 0 && contextItems.length === 0)) {
      return { question, contextItems, codeCitations, grounded: false };
    }

    const grounding = [
      contextItems.length
        ? "TEAM CONTEXT (decisions/conventions — honor these):\n" +
          contextItems.map((i) => `- [${i.type}] ${i.title}: ${i.body}`).join("\n")
        : "",
      chunks.length
        ? "CODE:\n" + chunks.map((c) => `// ${c.path}:${c.startLine}-${c.endLine}\n${c.content}`).join("\n\n")
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const answer = await provider.answer(question, grounding);
    return { question, contextItems, codeCitations, answer, grounded: true };
  }
}
