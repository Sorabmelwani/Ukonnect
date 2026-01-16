import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { prisma } from "../lib/prisma.js";

export const remindersRouter = Router();

remindersRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId: req.user!.id, sentAt: { not: null } },
      orderBy: { sentAt: "desc" },
      take: 30
    });
    res.json({ ok: true, reminders });
  } catch (e) {
    next(e);
  }
});
