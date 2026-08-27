export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Calls the Lovable AI Gateway (OpenAI-compatible chat completions).
 * Server-only: reads LOVABLE_API_KEY at call time. Never import from client code.
 */
export async function callAI(messages: ChatMessage[]): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    throw new Error("AI is not configured for this workspace yet.");
  }

  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages,
      }),
    });
  } catch {
    throw new Error("Could not reach the AI service. Check your connection and try again.");
  }

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    if (res.status === 429) {
      throw new Error("The AI service is rate-limited right now. Wait a moment and try again.");
    }
    if (res.status === 402) {
      throw new Error("AI credits are exhausted for this workspace. Top up credits to continue.");
    }
    throw new Error(`AI request failed (${res.status}). ${detail}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("The AI returned an empty response. Try regenerating.");
  return content;
}
