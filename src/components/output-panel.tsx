import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { saveItem, setHandoff } from "@/lib/saved";

type HandoffTarget = { label: string; tool: string };

export function OutputPanel({
  tool,
  title,
  content,
  onContentChange,
  onRegenerate,
  regenerating,
  handoffs,
}: {
  tool: string;
  title: string;
  content: string;
  onContentChange: (value: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
  handoffs?: HandoffTarget[];
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const save = () => {
    saveItem({ tool, title, content });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const handoff = (target: HandoffTarget) => {
    setHandoff(target.tool, content);
    navigate({ to: target.tool });
  };

  return (
    <section className="panel fade-up overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={copy} className="btn-ghost !px-3 !py-1.5 !text-xs">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={save} className="btn-ghost !px-3 !py-1.5 !text-xs">
            {saved ? <Check className="h-3.5 w-3.5 text-primary" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating}
            className="btn-ghost !px-3 !py-1.5 !text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </header>

      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        spellCheck={false}
        className="min-h-72 w-full resize-y bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-foreground outline-none"
        aria-label="AI output, editable"
      />

      {handoffs && handoffs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
          <span className="text-xs font-semibold text-muted-foreground">Send to:</span>
          {handoffs.map((h) => (
            <button
              key={h.tool}
              type="button"
              onClick={() => handoff(h)}
              className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-muted"
            >
              {h.label} →
            </button>
          ))}
        </div>
      )}

      <footer className="border-t border-border px-5 py-3">
        <div className="ai-disclaimer">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            AI-generated draft. Verify names, dates, figures and commitments before sending or
            acting on this output.
          </span>
        </div>
      </footer>
    </section>
  );
}
