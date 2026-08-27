import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { generateInsights } from "@/lib/ai.functions";
import { getSavedItems, removeItem, type SavedItem } from "@/lib/saved";
import heroImg from "@/assets/dashboard-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — BizPilot AI" },
      {
        name: "description",
        content:
          "Your intelligent business command centre: priorities, deadlines, productivity metrics and AI-driven business insights at a glance.",
      },
      { property: "og:title", content: "Dashboard — BizPilot AI" },
      {
        property: "og:description",
        content:
          "Track priorities, deadlines and productivity while AI surfaces workflow insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const WEEK = [
  { day: "Mon", tasks: 4 },
  { day: "Tue", tasks: 7 },
  { day: "Wed", tasks: 5 },
  { day: "Thu", tasks: 9 },
  { day: "Fri", tasks: 6 },
  { day: "Sat", tasks: 2 },
  { day: "Sun", tasks: 3 },
];

const PRIORITIES = [
  { label: "Send Q3 proposal to Northwind", due: "Today", tag: "High" },
  { label: "Prep board meeting summary", due: "Tomorrow", tag: "High" },
  { label: "Review research brief: EU market", due: "Fri", tag: "Medium" },
  { label: "Schedule 1:1s with design team", due: "Next week", tag: "Low" },
];

const TOOLS = [
  {
    to: "/emails",
    icon: Mail,
    name: "Smart Email Generator",
    desc: "Purpose, recipient, tone — get a ready-to-send draft.",
  },
  {
    to: "/meetings",
    icon: ClipboardList,
    name: "Meeting Summarizer",
    desc: "Raw notes become decisions, action items and open questions.",
  },
  {
    to: "/tasks",
    icon: CalendarCheck2,
    name: "Task Planner",
    desc: "Turn goals and action items into a prioritized schedule.",
  },
  {
    to: "/research",
    icon: Search,
    name: "Research Assistant",
    desc: "Briefs with built-in fact-check alerts on uncertain claims.",
  },
  {
    to: "/chatbot",
    icon: MessageSquareText,
    name: "Workplace Chatbot",
    desc: "Ask anything — drafting, brainstorming, prioritizing.",
  },
] as const;

function Dashboard() {
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(getSavedItems());
  }, []);

  const refreshInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const snapshot =
        `Completed tasks this week by day: ${WEEK.map((d) => `${d.day}: ${d.tasks}`).join(", ")}. ` +
        `Open priorities: ${PRIORITIES.map((p) => `${p.label} (due ${p.due}, ${p.tag})`).join("; ")}. ` +
        `Saved AI outputs in library: ${saved.length}.`;
      setInsights(await generateInsights({ data: { activitySummary: snapshot } }));
    } catch (e) {
      setInsightsError(e instanceof Error ? e.message : "Could not generate insights.");
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="panel relative overflow-hidden">
        <img
          src={heroImg}
          alt="Abstract visualization of the BizPilot AI command centre"
          width={1920}
          height={640}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative flex flex-col gap-3 px-6 py-12 sm:px-10 sm:py-16">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/70 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Command Centre
          </span>
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Your business, piloted by AI.
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Five connected tools — emails, meetings, tasks, research and chat — where one output
            flows straight into the next.
          </p>
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="panel px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tasks completed
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-primary">36</p>
          <p className="mt-1 text-xs text-muted-foreground">+18% vs last week</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Hours saved by AI
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-primary">9.5</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all five tools</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Deadlines this week
          </p>
          <p className="mt-2 font-display text-3xl font-extrabold text-primary">4</p>
          <p className="mt-1 text-xs text-muted-foreground">2 marked high priority</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Productivity chart + priorities */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <section className="panel px-5 py-5">
            <h2 className="text-sm font-bold tracking-tight">Weekly output</h2>
            <div className="mt-4 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEK} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.66 0.02 258)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.19 0.022 264)",
                      border: "1px solid oklch(1 0 0 / 12%)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "oklch(0.94 0.01 250)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="oklch(0.88 0.22 128)"
                    strokeWidth={2}
                    fill="oklch(0.88 0.22 128 / 18%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="panel px-5 py-5">
            <h2 className="text-sm font-bold tracking-tight">Priorities & deadlines</h2>
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {PRIORITIES.map((p) => (
                <li key={p.label} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-medium">{p.label}</span>
                  <span className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-bold ${
                        p.tag === "High"
                          ? "bg-destructive/15 text-destructive"
                          : p.tag === "Medium"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {p.tag}
                    </span>
                    <span className="text-muted-foreground">{p.due}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Business insights */}
          <section className="panel px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold tracking-tight">AI business insights</h2>
              <button
                type="button"
                onClick={refreshInsights}
                disabled={insightsLoading}
                className="btn-ghost !px-3 !py-1.5 !text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${insightsLoading ? "animate-spin" : ""}`} />
                {insights ? "Refresh" : "Generate"}
              </button>
            </div>
            {insightsLoading && (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="pulse-dot" /> Analyzing your workflow…
              </p>
            )}
            {insightsError && <p className="mt-4 text-sm text-destructive">{insightsError}</p>}
            {insights && !insightsLoading && (
              <pre className="mt-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {insights}
              </pre>
            )}
            {!insights && !insightsLoading && !insightsError && (
              <p className="mt-4 text-sm text-muted-foreground">
                Generate AI-driven recommendations based on this week's activity.
              </p>
            )}
          </section>
        </div>

        {/* Tools + saved library */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-bold tracking-tight">AI toolset</h2>
            {TOOLS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="panel group flex items-start gap-3 px-4 py-4 transition-colors hover:border-input"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <t.icon className="h-4.5 w-4.5 text-accent-foreground" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    {t.name}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {t.desc}
                  </span>
                </span>
              </Link>
            ))}
          </section>

          <section className="panel px-5 py-5">
            <h2 className="text-sm font-bold tracking-tight">Saved outputs</h2>
            {saved.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing saved yet. Outputs you save from any tool appear here.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {saved.slice(0, 6).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.tool}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${item.title}`}
                      onClick={() => {
                        removeItem(item.id);
                        setSaved(getSavedItems());
                      }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
