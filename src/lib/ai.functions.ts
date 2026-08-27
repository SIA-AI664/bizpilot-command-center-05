import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAI, type ChatMessage } from "./ai.server";

/**
 * Thin server-function wrappers only — all runtime helpers live in ai.server.ts.
 * Every prompt follows the Role + Task + Context structure.
 */

const RESPONSIBLE_AI_SUFFIX =
  "End your response with a short 'Verify before use' note flagging anything the human should double-check.";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          purpose: z.string().min(1),
          recipient: z.string().min(1),
          tone: z.string().min(1),
          context: z.string().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, an expert business communication writer. " +
          "Task: Draft a polished, ready-to-send professional email with a subject line. " +
          "Output format: 'Subject: ...' on the first line, a blank line, then the email body. Keep it concise and skimmable. " +
          RESPONSIBLE_AI_SUFFIX,
      },
      {
        role: "user",
        content:
          `Context: Recipient is ${data.recipient}. Desired tone: ${data.tone}. ` +
          `Purpose: ${data.purpose}.` +
          (data.context ? ` Additional context to weave in: ${data.context}` : ""),
      },
    ];
    return callAI(messages);
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          notes: z.string().min(1),
          focus: z.string().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, a meticulous executive meeting analyst. " +
          "Task: Turn raw meeting notes into a structured brief with these exact sections: " +
          "'Summary' (2-3 sentences), 'Key Decisions' (bullets), 'Action Items' (bullets, each with owner if mentioned and suggested due date), 'Open Questions' (bullets). " +
          RESPONSIBLE_AI_SUFFIX,
      },
      {
        role: "user",
        content:
          `Context: ${data.focus ? `Pay special attention to: ${data.focus}. ` : ""}` +
          `Raw meeting notes:\n${data.notes}`,
      },
    ];
    return callAI(messages);
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          input: z.string().min(1),
          horizon: z.string().min(1),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, a pragmatic project planner and scheduler. " +
          "Task: Convert the input (goals, notes, or action items) into a prioritized plan. " +
          "Output format: 'Priorities' (numbered, highest first, each with effort estimate S/M/L), " +
          "'Schedule' (bullets mapping tasks to days within the horizon), 'Risks & Dependencies' (bullets). " +
          RESPONSIBLE_AI_SUFFIX,
      },
      {
        role: "user",
        content: `Context: Planning horizon is ${data.horizon}. Input:\n${data.input}`,
      },
    ];
    return callAI(messages);
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          topic: z.string().min(1),
          angle: z.string().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, a rigorous business research assistant. " +
          "Task: Produce a concise research brief with sections: 'Overview', 'Key Findings' (bullets), " +
          "'Fact-Check Alerts' (bullets explicitly flagging claims that may be outdated, uncertain, or need source verification — never omit this section), 'Suggested Next Steps'. " +
          "Be explicit about uncertainty. " +
          RESPONSIBLE_AI_SUFFIX,
      },
      {
        role: "user",
        content:
          `Context: Research topic: ${data.topic}.` +
          (data.angle ? ` Specific angle: ${data.angle}.` : ""),
      },
    ];
    return callAI(messages);
  });

export const chatWithPilot = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
              }),
            )
            .max(100),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, a sharp, friendly workplace copilot inside a business command centre. " +
          "Task: Help with workplace questions — drafting, brainstorming, prioritizing, explaining concepts, giving productivity advice. " +
          "Context: The user is a busy professional. Be concise, use markdown formatting, and ask a clarifying question when the request is ambiguous. " +
          "When you state facts that could change over time, flag that they should be verified.",
      },
      ...data.history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
    ];
    return callAI(messages);
  });

export const generateInsights = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      z
        .object({
          activitySummary: z.string().min(1),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "Role: You are BizPilot, a workflow optimization analyst. " +
          "Task: Given a snapshot of a professional's recent activity, produce 3-4 sharp 'Business Insights' — " +
          "each one a bolded headline plus one sentence of actionable advice. Be specific, not generic. " +
          RESPONSIBLE_AI_SUFFIX,
      },
      { role: "user", content: `Context: Recent activity snapshot:\n${data.activitySummary}` },
    ];
    return callAI(messages);
  });
