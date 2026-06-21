import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../app/page";

const res = (data: unknown, ok = true, status = 200) =>
  ({ ok, status, json: async () => data }) as Response;

function mockFetch() {
  const ws = { workspaceId: "ws1", items: [{ id: "1", type: "convention", title: "Cents", body: "money as cents" }], files: { "CLAUDE.md": "# CLAUDE.md — my-team" } };
  global.fetch = vi.fn(async (url: RequestInfo | URL) => {
    const u = String(url);
    if (u.includes("/api/workspace")) return res(ws);
    if (u.includes("/api/context")) return res({ items: [...ws.items, { id: "2", type: "decision", title: "PG", body: "use postgres" }], files: ws.files });
    return res({});
  }) as typeof fetch;
}

describe("ContextOS page (component)", () => {
  beforeEach(() => mockFetch());

  it("renders accessible landmarks, labelled controls, and seeded context", async () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "ContextOS" })).toBeInTheDocument();
    // section landmarks have accessible names (aria-labelledby)
    expect(screen.getByRole("region", { name: /team context/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /ask/i })).toBeInTheDocument();
    // form controls are labelled (no placeholder-only inputs)
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Body")).toBeInTheDocument();
    expect(screen.getByLabelText("Your question")).toBeInTheDocument();
    // seeded item loads from /api/workspace
    await waitFor(() => expect(screen.getByText("Cents")).toBeInTheDocument());
  });

  it("adds a context item through the form", async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Cents")).toBeInTheDocument());
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Title"), "PG");
    await user.type(screen.getByLabelText("Body"), "use postgres");
    await user.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.getByText("PG")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalledWith("/api/context", expect.objectContaining({ method: "POST" }));
  });

  it("surfaces errors in an alert region", async () => {
    global.fetch = vi.fn(async () => res({ error: { message: "boom" } }, false, 500)) as typeof fetch;
    render(<Home />);
    // alert region exists for assistive tech
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
