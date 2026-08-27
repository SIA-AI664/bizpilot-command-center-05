import { createFileRoute } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { OutputPanel } from "@/components/output-panel";
import { runResearch } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — BizPilot AI" },
      {
        name: "description",
        content:
          "Concise research briefs with built-in fact-check alerts that flag uncertain or outdated claims before you rely on them.",
      },
      { property: "og:title", content: "Research Assistant — BizPilot AI" },
      {
        property: "og:description",
        content: "Business research briefs with explicit fact-check warnings and next steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = topic.trim().length > 0 && !loading;

  const run = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      setOutput(await runResearch({ data: { topic, angle } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
          <Search className="h-5 w-5 text-accent-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Research Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Every brief includes fact-check alerts on claims that need verification.
          </p>
        </div>
      </header>

      <section className="panel grid gap-4 px-5 py-5">
        <div>
          <label className="field-label" htmlFor="topic">
            Research topic
          </label>
          <input
            id="topic"
            className="field"
            placeholder="e.g. State of the SA e-commerce logistics market"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="angle">
            Specific angle (optional)
          </label>
          <input
            id="angle"
            className="field"
            placeholder="e.g. Opportunities for a mid-size B2B supplier"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
          />
        </div>
        <div>
          <button type="button" onClick={run} disabled={!canGenerate} className="btn-primary">
            <Sparkles className="h-4 w-4" />
            {loading ? "Researching…" : "Run research"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      {output && (
        <OutputPanel
          tool="Research Assistant"
          title="Research brief"
          content={output}
          onContentChange={setOutput}
          onRegenerate={run}
          regenerating={loading}
          handoffs={[
            { label: "Email Generator", tool: "/emails" },
            { label: "Task Planner", tool: "/tasks" },
          ]}
        />
      )}
    </div>
  );
}
