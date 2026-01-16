import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { tasksRouter } from "./routes/tasks.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { documentsRouter } from "./routes/documents.js";
import { servicesRouter } from "./routes/services.js";
import { communityRouter } from "./routes/community.js";
import { faqRouter } from "./routes/faq.js";
import { aiRouter } from "./routes/ai.js";
import { remindersRouter } from "./routes/reminders.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { meRouter } from "./routes/me.js";


export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => res.json({ name: "UKonnect API", ok: true }));
  app.use("/health", healthRouter);
  app.use("/auth", authRouter);

  app.use("/tasks", tasksRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/documents", documentsRouter);
  app.use("/services", servicesRouter);
  app.use("/community", communityRouter);
  app.use("/faq", faqRouter);
  app.use("/ai", aiRouter);
  app.use("/reminders", remindersRouter);
  app.use(errorHandler);
  app.use("/me", meRouter);



  return app;
}
