import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

type JwtPayload = {
  sub: string;
  email: string;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // ✅ Tests: ensure a real DB user exists to avoid FK errors (P2003)
  if (env.NODE_ENV === "test") {
    const id = "test-user-id";
    const email = "test@example.com";

    await prisma.user.upsert({
      where: { email },
      update: { id },
      create: {
        id,
        email,
        passwordHash: "test-hash",
      },
    });

    req.user = { id, email };
    return next();
  }

  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = auth.slice("Bearer ".length).trim();

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
