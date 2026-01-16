import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

export const faqRouter = Router();

faqRouter.get("/", async (req, res, next) => {
  try {
    const schema = z.object({
      topic: z.string().optional(),
      city: z.string().optional(),
      visaType: z.string().optional()
    });
    const q = schema.parse(req.query);

    const entries = await prisma.faqEntry.findMany({
      where: {
        ...(q.topic ? { topic: { contains: q.topic, mode: "insensitive" } } : {}),
        ...(q.city ? { OR: [{ city: null }, { city: { contains: q.city, mode: "insensitive" } }] } : {}),
        ...(q.visaType ? { OR: [{ visaType: null }, { visaType: { contains: q.visaType, mode: "insensitive" } }] } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    res.json({ ok: true, entries });
  } catch {
    next(new HttpError(400, "Invalid query"));
  }
});
