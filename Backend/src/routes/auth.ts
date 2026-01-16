import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().optional(),
  nationality: z.string().optional(),
  city: z.string().optional(),
  visaType: z.string().optional(),
  purpose: z.string().optional(),
  goals: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAccessToken(user: { id: string; email: string }) {
  // IMPORTANT: requireAuth expects { sub, email }
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );
}

function signRefreshToken(user: { id: string; email: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
}

// POST /auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, fullName, nationality, city, visaType, purpose, goals } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    // Create profile with additional data
    await prisma.profile.create({
      data: {
        userId: user.id,
        fullName: fullName || null,
        nationality: nationality || null,
        city: city || null,
        visaType: visaType || null,
        purpose: purpose || null,
      },
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Optional: store refresh token hash in DB (you already have RefreshToken model)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
      },
    });

    res.status(201).json({
      ok: true,
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) throw new HttpError(401, "Invalid email or password");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid email or password");

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const refreshToken = signRefreshToken({ id: user.id, email: user.email });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
      },
    });

    res.json({
      ok: true,
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/refresh
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new HttpError(400, "Refresh token required");

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      throw new HttpError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true },
    });

    if (!user) throw new HttpError(401, "User not found");

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(newRefreshToken, 10),
      },
    });

    res.json({
      ok: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
});
