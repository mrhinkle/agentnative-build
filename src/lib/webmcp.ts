/**
 * webmcp.ts — registers this site's tools with the browser via WebMCP when the API exists.
 * WebMCP is a draft proposal and its entry point has moved between drafts, so we feature-detect both
 * navigator.modelContext and document.modelContext, and do nothing if neither is present.
 */
import { PAGE_PATHS, TOOLS, toolResult, errorResult } from "./tools";

interface Handlers {
  setReader: (agent: boolean) => void;
  open: (path: string) => void;
}

const text = (t: string) => ({ content: [{ type: "text", text: t }] });

export function registerWebMcp(h: Handlers): () => void {
  const mc: any = (navigator as any).modelContext ?? (document as any).modelContext;
  if (!mc || typeof mc.registerTool !== "function") return () => {};

  const names: string[] = [];
  const register = (tool: Record<string, unknown>) => {
    try { mc.registerTool(tool); names.push(tool.name as string); } catch { /* duplicate or unsupported shape */ }
  };

  for (const t of TOOLS) {
    register({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      annotations: { readOnlyHint: true },
      execute: async (args: unknown) => {
        try { return { content: toolResult(t, args).content }; }
        catch (e) { const r = errorResult(e); return { content: r.content, isError: true }; }
      },
    });
  }

  register({
    name: "set_reader_view",
    description: "Switch this page between the human view and the agent (Markdown) view.",
    inputSchema: { type: "object", properties: { mode: { type: "string", enum: ["human", "agent"] } }, required: ["mode"], additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async ({ mode }: { mode: string }) => { h.setReader(mode === "agent"); return text(`Reader view set to ${mode}.`); },
  });
  register({
    name: "open_page",
    description: "Navigate to a page on this site.",
    inputSchema: { type: "object", properties: { path: { type: "string", enum: PAGE_PATHS } }, required: ["path"], additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async ({ path }: { path: string }) => {
      if (!PAGE_PATHS.includes(path)) return { ...text("Unknown path."), isError: true };
      h.open(path); return text(`Opened ${path}.`);
    },
  });

  return () => { for (const n of names) { try { mc.unregisterTool?.(n); } catch { /* ignore */ } } };
}
