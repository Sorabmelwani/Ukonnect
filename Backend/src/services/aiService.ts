import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import OpenAI from "openai";

type ContextItem = { type: string; title: string; content: string; url?: string | null };

export async function buildContext(userId: string, question: string): Promise<ContextItem[]> {
  const me = await prisma.profile.findUnique({ where: { userId } });

  const q = question.trim().slice(0, 200);

  const faqs = await prisma.faqEntry.findMany({
    where: {
      OR: [
        { topic: { contains: q } },
        { question: { contains: q } }
      ]
    },
    take: 5
  });

  const services = me?.city
    ? await prisma.localService.findMany({
      where: { city: { contains: me.city } },
      take: 5
    })
    : [];

  const tasks = await prisma.userTask.findMany({
    where: { userId },
    orderBy: { dueAt: "asc" },
    take: 5
  });

  const ctx: ContextItem[] = [];

  for (const f of faqs) {
    ctx.push({ type: "faq", title: f.question, content: f.answer, url: f.officialUrl });
  }
  for (const s of services) {
    ctx.push({ type: "service", title: s.name, content: `${s.category} in ${s.city}. ${s.description ?? ""}`, url: s.website });
  }
  for (const t of tasks) {
    ctx.push({ type: "task", title: t.title, content: `${t.category} • ${t.status} • due ${t.dueAt ? t.dueAt.toISOString().slice(0, 10) : "n/a"}` });
  }

  return ctx;
}

/**
 * MVP response generator without an LLM:
 * - Uses retrieval context and produces a structured response.
 * This keeps the system functional even without API keys.
 */
export function simpleAnswer(question: string, context: ContextItem[]) {
  const lines: string[] = [];
  lines.push("Here’s what I can suggest based on the info available in the app (not legal advice):");
  lines.push("");
  lines.push(`Question: ${question}`);
  lines.push("");

  if (!context.length) {
    lines.push("I don’t have a matching FAQ in the database yet. Try checking GOV.UK/NHS official pages, or ask a more specific question (city + visa type + task).");
    return { answer: lines.join("\n"), sources: [] as ContextItem[] };
  }

  // lines.push("Relevant items:");
  // context.slice(0, 8).forEach((c, i) => {
  //   lines.push(`${i + 1}. [${c.type}] ${c.title} — ${c.content}${c.url ? ` (${c.url})` : ""}`);
  // });

  lines.push("");
  lines.push("If you want, I can convert this into a step-by-step checklist for your profile.");

  return { answer: lines.join("\n"), sources: context };
}

/**
 * OpenAI API-powered response generator
 * - Uses GPT to generate intelligent responses based on context
 * - Requires OPENAI_API_KEY in .env file
 * - Falls back to simpleAnswer if API key is not available
 */
export async function openAiAnswer(question: string, context: ContextItem[]) {
  if (!env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not configured, falling back to simpleAnswer");
    return simpleAnswer(question, context);
  }

  try {
    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Build context string for the prompt
    const contextStr = context
      .slice(0, 8)
      .map(
        (c, i) =>
          `${i + 1}. [${c.type}] ${c.title}: ${c.content}${c.url ? ` (${c.url})` : ""}`
      )
      .join("\n");

    const systemPrompt = `You are a helpful UK immigration assistant. You provide clear, accurate, and structured advice about UK immigration, visas, and related services. Always be empathetic and professional. Do not provide legal advice, but suggest consulting official sources like GOV.UK or a solicitor when needed.`;

    const userPrompt = `Based on the following context and the user's question, provide a helpful and structured answer:

Context:
${contextStr || "No specific context available"}

User Question: ${question}

Please provide a clear, step-by-step response if applicable. Include relevant sources from the context if they exist.`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "Could not generate a response. Please try again.";

    return { answer, sources: context };
  } catch (error) {
    console.error("OpenAI API call failed:", error);
    // Fallback to simple answer on error
    return simpleAnswer(question, context);
  }
}
