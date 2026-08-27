import { createFileRoute } from "@tanstack/react-router";
import { Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { OutputPanel } from "@/components/output-panel";
import { generateEmail } from "@/lib/ai.functions";
import { takeHandoff } from "@/lib/saved";

export const Route = createFileRoute("/emails")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — BizPilot AI" },
      {
        name: "description",
        content:
          "Draft polished, ready-to-send business emails from purpose, recipient and tone — with human verification built in.",
      },
      { property: "og:title", content: "Smart Email Generator — BizPilot AI" },
      {
        property: "og:description",
        content: "Turn a purpose and a tone into a professional email draft in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailsPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Persuasive", "Apologetic"];

function EmailsPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cross-tool handoff: meeting summaries / research briefs arrive as context.
  useEffect(() => {
    const handed = takeHandoff("/emails");
    if (handed) setContext(handed);
  }, []);

  const canGenerate = purpose.trim() && recipient.trim() && !loading;

  const run = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    try {
      setOutput(await generateEmail({ data: { purpose, recipient, tone, context } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
          <Mail className="h-5 w-5 text-accent-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">
            Describe the goal — get a ready-to-send draft you can edit, copy or save.
          </p>
        </div>
      </header>

      <section className="panel grid gap-4 px-5 py-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="purpose">
            Purpose of the email
          </label>
          <input
            id="purpose"
            className="field"
            placeholder="e.g. Follow up on the Q3 proposal and request a decision by Friday"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="recipient">
            Recipient
          </label>
          <input
            id="recipient"
            className="field"
            placeholder="e.g. Dana, Procurement Lead at Northwind"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="tone">
            Tone
          </label>
          <select
            id="tone"
            className="field"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="context">
            Context (optional — auto-filled when sent from another tool)
          </label>
          <textarea
            id="context"
            className="field min-h-24 resize-y"
            placeholder="Paste meeting notes, research findings or any background the draft should use."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <button type="button" onClick={run} disabled={!canGenerate} className="btn-primary">
            <Sparkles className="h-4 w-4" />
            {loading ? "Drafting…" : "Generate email"}
          </button>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </section>

      {output && (
        <OutputPanel
          tool="Email Generator"
          title="Generated draft"
          content={output}
          onContentChange={setOutput}
          onRegenerate={run}
          regenerating={loading}
        />
      )}
    </div>
  );
}
