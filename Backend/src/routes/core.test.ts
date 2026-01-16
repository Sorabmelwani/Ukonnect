import "dotenv/config";
import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, beforeAll } from "vitest";

import { prisma } from "../lib/prisma.js";
import { createApp } from "../app.js"; // adjust if your app export is different
import { env } from "../config/env.js";

const app = createApp();

let token = "";

beforeAll(async () => {
  // Create a real user in the test DB
  const email = `test_${Date.now()}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: "test-hash",
      profile: { create: {} },
    },
    select: { id: true, email: true },
  });

  // Sign token EXACTLY as requireAuth expects: { sub, email }
  token = jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );
});

describe("Core APIs", () => {
  it("generate tasks + dashboard", async () => {
    const gen = await request(app)
      .post("/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(gen.status).toBe(200);

    const dash = await request(app)
      .get("/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(dash.status).toBe(200);
  });

  it("ai chat works", async () => {
    const ai = await request(app)
      .post("/ai/chat")
      .set("Authorization", `Bearer ${token}`)
      .send({ message: "How do I register with a GP?" });

    expect(ai.status).toBe(200);

    // Keep this assertion only if your aiService returns this exact disclaimer text.
    // If your response uses a different field, adjust accordingly.
    expect((ai.body.answer ?? "").toLowerCase()).toContain("not legal advice");
  });
});
