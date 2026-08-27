import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Sparkles } from "lucide-react";
import { useState } from "react";
import { OutputPanel } from "@/components/output-panel";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — BizPilot AI" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into decisions, action items and open questions — then hand them straight to the task planner or email generator.",
      },
      { property: "og:title", content: "Meeting Summarizer — BizPilot AI" },
      {
        property: "og:description",
        content: "Structured meeting briefs with action items, ready to feed your workflow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = notes.trim().length > 0 && !loading;

  const run = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      setOutput(await summarizeMeeting({ data: { notes, focus } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summarization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
          <ClipboardList className="h-5 w-5 text-accent-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Meeting Summarizer</h1>
          <p className="text-sm text-muted-foreground">
            Paste raw notes — get decisions, action items and open questions.
          </p>
        </div>
      </header>

      <section className="panel grid gap-4 px-5 py-5">
        <div>
          <label className="field-label" htmlFor="notes">
            Raw meeting notes or transcript
          </label>
          <textarea
            id="notes"
            className="field min-h-44 resize-y"
            placeholder="Paste everything you captured — messy is fine."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="focus">
            Focus area (optional)
          </label>
          <input
            id="focus"
            className="field"
            placeholder="e.g. Budget decisions and who owns what"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>
        <div>
          <button type="button" onClick={run} disabled={!canGenerate} className="btn-primary">
            <Sparkles className="h-4 w-4" />
            {loading ? "Summarizing…" : "Summarize meeting"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      {output && (
        <OutputPanel
          tool="Meeting Summarizer"
          title="Meeting brief"
          content={output}
          onContentChange={setOutput}
          onRegenerate={run}
          regenerating={loading}
          handoffs={[
            { label: "Task Planner", tool: "/tasks" },
            { label: "Email Generator", tool: "/emails" },
          ]}
        />
      )}
    </div>
  );
}
