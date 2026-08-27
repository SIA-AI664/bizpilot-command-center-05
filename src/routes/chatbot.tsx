import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareText, SendHorizonal, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { chatWithPilot } from "@/lib/ai.functions";

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "Workplace Chatbot — BizPilot AI" },
      {
        name: "description",
        content:
          "Chat with BizPilot, your workplace copilot — drafting, brainstorming, prioritizing and quick answers with responsible-AI guardrails.",
      },
      { property: "og:title", content: "Workplace Chatbot — BizPilot AI" },
      {
        property: "og:description",
        content: "A sharp workplace copilot for everyday questions and drafting tasks.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatbotPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Help me prioritize my week",
  "Draft a Slack update about our launch delay",
  "Explain net revenue retention simply",
  "Brainstorm names for our Q4 campaign",
];

function ChatbotPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const reply = await chatWithPilot({ data: { history: next.slice(-40) } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
          <MessageSquareText className="h-5 w-5 text-accent-foreground" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Workplace Chatbot</h1>
          <p className="text-sm text-muted-foreground">
            Ask BizPilot anything — drafts, ideas, priorities, explanations.
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="panel flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-sm text-sm text-muted-foreground">
              Start a conversation, or try one of these:
            </p>
            <div className="flex max-w-lg flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "panel-raised text-foreground"
                }`}
              >
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <>
                    <div className="chat-md">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <ShieldAlert className="h-3 w-3 shrink-0" />
                      AI-generated — verify important details before acting.
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="panel-raised flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                <span className="pulse-dot" /> BizPilot is thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          className="field flex-1"
          placeholder="Message BizPilot…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message BizPilot"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-primary !px-4"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
