import cron from "node-cron";
import { prisma } from "../lib/prisma.js";

let isRunning = false;

export function startReminderWorker() {
  // Every 5 minutes - reduced frequency to prevent overlap
  cron.schedule("*/5 * * * *", async () => {
    // Skip if already running to prevent overlapping executions
    if (isRunning) {
      console.warn("[REMINDER-WORKER] Previous job still running, skipping this execution");
      return;
    }

    isRunning = true;
    try {
      const now = new Date();

      // Use updateMany for better performance instead of looping
      const due = await prisma.reminder.findMany({
        where: { sentAt: null, remindAt: { lte: now } },
        take: 100
      });

      if (!due.length) return;

      // Batch update all reminders at once
      await prisma.reminder.updateMany({
        where: {
          id: { in: due.map(r => r.id) }
        },
        data: { sentAt: new Date() }
      });

      console.log(`[REMINDER-WORKER] Processed ${due.length} reminders`);
    } catch (error) {
      console.error("[REMINDER-WORKER] Error processing reminders:", error);
    } finally {
      isRunning = false;
    }
  });
}
