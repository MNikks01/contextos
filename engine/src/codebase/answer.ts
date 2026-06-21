// VENDORED from codebase-intelligence/engine/src/answer.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Grounded answer generation. No LLM key -> retrieval-only (cited chunks, no prose).
// With ANTHROPIC_API_KEY -> a grounded answer that cites file:line or says "I don't know".

export interface AnswerProvider {
  answer(question: string, context: string): Promise<string>;
}

export class ClaudeAnswer implements AnswerProvider {
  private apiKey: string;
  private model: string;
  constructor(apiKey: string, model = "claude-sonnet-4-6") {
    this.apiKey = apiKey;
    this.model = model;
  }
  async answer(question: string, context: string): Promise<string> {
    const system =
      "You answer questions about a codebase using ONLY the provided code chunks. " +
      "Cite evidence as file:line. If the answer is not in the chunks, say you don't know.";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 700,
        system,
        messages: [{ role: "user", content: `Question: ${question}\n\nCode chunks:\n${context}` }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = (await res.json()) as { content?: { text?: string }[] };
    return data.content?.[0]?.text?.trim() ?? "(no answer)";
  }
}

export function pickAnswerProvider(): AnswerProvider | null {
  const key = process.env.ANTHROPIC_API_KEY;
  return key ? new ClaudeAnswer(key) : null;
}
