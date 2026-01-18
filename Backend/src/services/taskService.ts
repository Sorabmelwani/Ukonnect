import { prisma } from "../lib/prisma.js";

export const TASK_CATEGORIES = [
  "LEGAL",
  "HEALTHCARE",
  "FINANCIAL",
  "ACCOMMODATION",
  "CONNECTIVITY",
  "SOCIAL",
  "EDUCATION",
] as const;

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const TASK_STATUSES = ["PENDING", "COMPLETED"] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

type ProfileLite = {
  visaType?: string | null;
  purpose?: string | null;
  city?: string | null;
  nationality?: string | null;
};

type TaskTemplateLite = {
  id: string;
  title: string;
  description: string;
  category: string;
  defaultPriority: string;
  visaTypeMatch: string | null;
  purposeMatch: string | null;
  cityMatch: string | null;
  nationalityMatch: string | null;
  officialUrl: string | null;
  sortOrder: number;
};

function matches(templateValue?: string | null, profileValue?: string | null) {
  if (!templateValue) return true;
  if (!profileValue) return false;
  return profileValue.toLowerCase().includes(templateValue.toLowerCase());
}

function isTaskPriority(v: unknown): v is TaskPriority {
  return typeof v === "string" && (TASK_PRIORITIES as readonly string[]).includes(v);
}

export async function generateTasksForUser(userId: string) {
  // Check if user has already had tasks generated to prevent duplicate generation
  const taskCount = await prisma.userTask.count({ where: { userId } });
  if (taskCount > 0) {
    // Tasks already exist for this user, return empty array
    return [];
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const p: ProfileLite = profile ?? {};

  const templates = (await prisma.taskTemplate.findMany({
    orderBy: { sortOrder: "asc" },
  })) as unknown as TaskTemplateLite[];

  const applicable = templates.filter(
    (t: TaskTemplateLite) =>
      matches(t.visaTypeMatch, p.visaType) &&
      matches(t.purposeMatch, p.purpose) &&
      matches(t.cityMatch, p.city) &&
      matches(t.nationalityMatch, p.nationality)
  );

  const templateIds = applicable.map((a: { id: string }) => a.id);

  const existing = await prisma.userTask.findMany({
    where: { userId, templateId: { in: templateIds } },
    select: { templateId: true },
  });

  const existingSet = new Set(existing.map((e: { templateId: string | null }) => e.templateId).filter(Boolean) as string[]);

  const now = new Date();
  const created = [];

  for (const t of applicable) {
    if (existingSet.has(t.id)) continue;

    const normalizedPriority = typeof t.defaultPriority === "string" ? t.defaultPriority.toUpperCase() : null;
    const priority: TaskPriority = isTaskPriority(normalizedPriority) ? normalizedPriority : "MEDIUM";

    const dueDays =
      priority === "URGENT" ? 3 : priority === "HIGH" ? 7 : priority === "MEDIUM" ? 14 : 21;

    const dueAt = new Date(now.getTime() + dueDays * 24 * 60 * 60 * 1000);

    try {
      const ut = await prisma.userTask.create({
        data: {
          userId,
          templateId: t.id,
          title: t.title,
          description: t.description,
          category: t.category,
          priority,
          status: "PENDING",
          url: t.officialUrl,
          dueAt,
        },
      });

      const remindAt = new Date(dueAt.getTime() - 48 * 60 * 60 * 1000);
      await prisma.reminder.create({
        data: { userId, userTaskId: ut.id, remindAt },
      });

      created.push(ut);
    } catch (error: any) {
      // If unique constraint violation, task already exists, skip it
      if (error.code === "P2002") {
        continue;
      }
      throw error;
    }
  }

  return created;
}

export async function listTasks(
  userId: string,
  filters: { status?: TaskStatus; category?: TaskCategory; priority?: TaskPriority }
) {
  return prisma.userTask.findMany({
    where: {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
    },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { priority: "desc" }],
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  patch: Partial<{ status: TaskStatus; priority: TaskPriority; dueAt: Date | null; notes: string | null }>
) {
  const task = await prisma.userTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) throw new Error("NOT_FOUND");

  const completedAt =
    patch.status === "COMPLETED"
      ? new Date()
      : patch.status === "PENDING"
      ? null
      : task.completedAt;

  const data: {
    status?: TaskStatus;
    priority?: TaskPriority;
    dueAt?: Date | null;
    completedAt?: Date | null;
    notes?: string | null;
  } = {};

  if (patch.status) data.status = patch.status;
  if (patch.priority) data.priority = patch.priority;
  if (patch.dueAt !== undefined) data.dueAt = patch.dueAt;
  if (patch.notes !== undefined) data.notes = patch.notes;
  data.completedAt = completedAt;

  return prisma.userTask.update({
    where: { id: taskId },
    data,
  });
}

export async function dashboard(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const total = await prisma.userTask.count({ where: { userId } });
  const completed = await prisma.userTask.count({
    where: { userId, status: "COMPLETED" },
  });
  const pending = total - completed;

  const upcoming = await prisma.userTask.findMany({
    where: { userId, dueAt: { not: null } },
    orderBy: { dueAt: "asc" },
  });

  const reminders = await prisma.reminder.findMany({
    where: { userId, sentAt: null },
    orderBy: { remindAt: "asc" },
  });

  return {
    total,
    completed,
    pending,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    upcoming,
    reminders,
    profile: profile || null,
  };
}
