import { buildCopyPrompt, extractCopyJson, validateCopyRequest } from "../../shared/copy-prompt.js";

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "invalid-json" }, 400);
  }
  if (!validateCopyRequest(body)) return json({ error: "invalid-request" }, 400);

  const apiKey = context.env.AI_API_KEY;
  const model = context.env.AI_MODEL;
  const baseUrl = context.env.AI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey || !model) return json({ error: "ai-not-configured" }, 503);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14500);
  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "严格按用户给出的规则返回 JSON。" },
          { role: "user", content: buildCopyPrompt(body) },
        ],
      }),
      signal: controller.signal,
    });
    if (!upstream.ok) return json({ error: "ai-upstream-error" }, 502);
    const payload = await upstream.json();
    return json(extractCopyJson(payload.choices?.[0]?.message?.content || ""));
  } catch (error) {
    return json({ error: error?.name === "AbortError" ? "ai-timeout" : "ai-unavailable" }, error?.name === "AbortError" ? 504 : 502);
  } finally {
    clearTimeout(timeout);
  }
}
