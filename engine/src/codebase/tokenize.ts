// VENDORED from codebase-intelligence/engine/src/tokenize.ts — DO NOT EDIT.
// Re-vendor: node engine/scripts/vendor-codebase-engine.mjs

// Code-aware tokenizer: splits camelCase / snake_case / PascalCase so a query like
// "validate webhook" matches identifiers like `validateWebhook` / `validate_webhook`.

export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 2 && t.length <= 40);
}
