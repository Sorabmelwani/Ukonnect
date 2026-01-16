import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { dashboard } from "../services/taskService.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const data = await dashboard(req.user!.id);
    res.json({ ok: true, dashboard: data });
  } catch (e) {
    next(e);
  }
});
