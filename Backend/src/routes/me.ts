import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../utils/httpError.js";

export const meRouter = Router();

const visaVerificationSchema = z.object({
  visaShareCode: z.string().min(1, "Visa share code is required"),
  visaExpiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
});

const notificationSettingsSchema = z.object({
  notificationEmail: z.boolean().optional(),
  notificationPush: z.boolean().optional(),
});

const privacySettingsSchema = z.object({
  profileVisible: z.boolean().optional(),
  showNationality: z.boolean().optional(),
  showLocation: z.boolean().optional(),
});

const allSettingsSchema = notificationSettingsSchema.merge(privacySettingsSchema);

/**
 * GET /me/profile
 */
meRouter.get("/profile", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      email: true,
      profile: true,
    },
  });

  if (!user?.profile) {
    return res.json({ email: user?.email, profile: null });
  }

  res.json({ email: user.email, profile: user.profile });
});

/**
 * PUT /me/profile
 */
meRouter.put("/profile", requireAuth, async (req, res) => {
  const { fullName, nationality, city, visaType } = req.body;

  const profile = await prisma.profile.upsert({
    where: { userId: req.user!.id },
    update: {
      fullName,
      nationality,
      city,
      visaType,
    },
    create: {
      userId: req.user!.id,
      fullName,
      nationality,
      city,
      visaType,
    },
  });

  res.json(profile);
});

/**
 * POST /me/verify-visa
 * Store visa share code and expiry date
 */
meRouter.post("/verify-visa", requireAuth, async (req, res, next) => {
  try {
    const { visaShareCode, visaExpiryDate } = visaVerificationSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.user!.id },
      update: {
        visaShareCode,
        visaExpiryDate: new Date(visaExpiryDate),
      },
      create: {
        userId: req.user!.id,
        visaShareCode,
        visaExpiryDate: new Date(visaExpiryDate),
      },
    });

    res.json({ ok: true, message: "Visa information stored successfully", profile });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /me/settings
 * Get all notification and privacy settings
 */
meRouter.get("/settings", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
      select: {
        notificationEmail: true,
        notificationPush: true,
        profileVisible: true,
        showNationality: true,
        showLocation: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ ok: false, message: "Profile not found" });
    }

    res.json({
      ok: true,
      settings: {
        notifications: {
          email: profile.notificationEmail,
          push: profile.notificationPush,
        },
        privacy: {
          profileVisible: profile.profileVisible,
          showNationality: profile.showNationality,
          showLocation: profile.showLocation,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /me/settings
 * Update notification and privacy settings
 */
meRouter.put("/settings", requireAuth, async (req, res, next) => {
  try {
    const updates = allSettingsSchema.parse(req.body);

    const profile = await prisma.profile.upsert({
      where: { userId: req.user!.id },
      update: updates,
      create: {
        userId: req.user!.id,
        ...updates,
      },
    });

    res.json({
      ok: true,
      message: "Settings updated successfully",
      settings: {
        notifications: {
          email: profile.notificationEmail,
          push: profile.notificationPush,
        },
        privacy: {
          profileVisible: profile.profileVisible,
          showNationality: profile.showNationality,
          showLocation: profile.showLocation,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid settings: " + err.errors.map(e => e.message).join(", ")));
    } else {
      next(err);
    }
  }
});
