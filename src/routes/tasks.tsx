import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { OutputPanel } from "@/components/output-panel";
import { planTasks } from "@/lib/ai.functions";
import { takeHandoff } from "@/lib/saved";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner & Scheduler — BizPilot AI" },
      {
        name: "description",
        content:
          "Convert goals, notes and action items into a prioritized plan with effort estimates, a day-by-day schedule and risk flags.",
      },
      { property: "og:title", content: "Task Planner & Scheduler — BizPilot AI" },
      {
        property: "og:description",
        content: "AI-planned priorities and schedules from any input — including meeting briefs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TasksPage,
});

const HORIZONS = ["Today", "This week", "Next two weeks", "This month"];

function TasksPage() {
  const [input, setInput] = useState("");
  const [horizon, setHorizon] = useState(HORIZONS[1]);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cross-tool handoff: action items from Meeting Summarizer prefill this input.
  useEffect(() => {
    const handed = takeHandoff("/tasks");
    if (handed) setInput(handed);
  }, []);

  const canGenerate = input.trim().length > 0 && !loading;

  const run = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      setOutput(await planTasks({ data: { input, horizon } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Planning failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
          <CalendarCheck2 className="h-5 w-5 text-accent-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Task Planner & Scheduler</h1>
          <p className="text-sm text-muted-foreground">
            Drop in goals or action items — get a prioritized, scheduled plan.
          </p>
        </div>
      </header>

      <section className="panel grid gap-4 px-5 py-5">
        <div>
          <label className="field-label" htmlFor="plan-input">
            Goals, notes or action items
          </label>
          <textarea
            id="plan-input"
            className="field min-h-40 resize-y"
            placeholder="e.g. Launch partner newsletter, fix onboarding drop-off, prepare board deck…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="horizon">
            Planning horizon
          </label>
          <select
            id="horizon"
            className="field"
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
          >
            {HORIZONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button type="button" onClick={run} disabled={!canGenerate} className="btn-primary">
            <Sparkles className="h-4 w-4" />
            {loading ? "Planning…" : "Build my plan"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      {output && (
        <OutputPanel
          tool="Task Planner"
          title="Your plan"
          content={output}
          onContentChange={setOutput}
          onRegenerate={run}
          regenerating={loading}
          handoffs={[{ label: "Email Generator", tool: "/emails" }]}
        />
      )}
    </div>
  );
}
