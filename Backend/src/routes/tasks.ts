import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../utils/httpError.js";
import {
  generateTasksForUser,
  listTasks,
  updateTask,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "../services/taskService.js";

export const tasksRouter = Router();

tasksRouter.post("/generate", requireAuth, async (req, res, next) => {
  try {
    const created = await generateTasksForUser(req.user!.id);
    res.json({ ok: true, created });
  } catch (e) {
    next(e);
  }
});

tasksRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(TASK_STATUSES).optional(),
      category: z.enum(TASK_CATEGORIES).optional(),
      priority: z.enum(TASK_PRIORITIES).optional(),
    });

    const q = schema.parse(req.query);

    const filters: { status?: TaskStatus; category?: TaskCategory; priority?: TaskPriority } = {};
    if (q.status !== undefined) filters.status = q.status;
    if (q.category !== undefined) filters.category = q.category;
    if (q.priority !== undefined) filters.priority = q.priority;

    const tasks = await listTasks(req.user!.id, filters);
    res.json({ ok: true, tasks });
  } catch (e) {
    next(new HttpError(400, "Invalid filters"));
  }
});

tasksRouter.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const taskId = z.string().min(1).parse(req.params.id);

    const bodySchema = z.object({
      status: z.enum(TASK_STATUSES).optional(),
      priority: z.enum(TASK_PRIORITIES).optional(),
      dueAt: z.string().datetime().optional(),
    });

    const body = bodySchema.parse(req.body);

    const patch: Partial<{ status: TaskStatus; priority: TaskPriority; dueAt: Date | null }> = {};

    if (body.status !== undefined) patch.status = body.status;
    if (body.priority !== undefined) patch.priority = body.priority;
    if (body.dueAt !== undefined) patch.dueAt = new Date(body.dueAt);

    const updated = await updateTask(req.user!.id, taskId, patch);

    res.json({ ok: true, task: updated });
  } catch (e) {
    next(new HttpError(400, "Invalid update"));
  }
});
