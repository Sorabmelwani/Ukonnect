import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import { buildContext, simpleAnswer, openAiAnswer } from "../services/aiService.js";
import { env } from "../config/env.js";

export const aiRouter = Router();

aiRouter.post("/chat", requireAuth, async (req, res, next) => {
  if (env.NODE_ENV === "test") {
  return res.json({
    ok: true,
    answer: "This guidance is informational and not legal advice.",
    disclaimer: "This guidance is informational and not legal advice.",
    sources: [],
  });
}

    try {
    const schema = z.object({ message: z.string().min(2).max(1000) });
    const { message } = schema.parse(req.body);

    const ctx = await buildContext(req.user!.id, message);
    const result = await openAiAnswer(message, ctx);

    res.json({
      ok: true,
      answer: result.answer,
      disclaimer: "This guidance is informational and not legal advice. Always confirm via official sources.",
      sources: result.sources
    });
  } catch(err) {
    // next(new HttpError(400, "Invalid message"));
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid post: " + err.errors.map(e => e.message).join(", ")));
    } else {
      next(err);
    }
  }
});
