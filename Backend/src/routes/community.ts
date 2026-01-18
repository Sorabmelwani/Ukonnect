import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

export const communityRouter = Router();

communityRouter.get("/stats", async (req, res, next) => {
  try {
    const [activeMembers, countries, successStories, questionsAnswered] = await Promise.all([
      prisma.user.count(),
      prisma.profile.findMany({
        where: { nationality: { not: null } },
        distinct: ["nationality"],
        select: { nationality: true }
      }).then(profiles => profiles.length),
      prisma.post.findMany({
        where: { tags: { contains: "success" } },
        select: { id: true }
      }).then(posts => posts.length),
      prisma.reply.count()
    ]);

    res.json({
      ok: true,
      stats: {
        activeMembers,
        countries,
        successStories,
        questionsAnswered
      }
    });
  } catch (e) {
    next(e);
  }
});

communityRouter.get("/posts", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true }
            }
          }
        },
        replies: {
          orderBy: { createdAt: "asc" },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: { fullName: true }
                }
              }
            }
          }
        }
      }
    });
    res.json({ ok: true, posts });
  } catch (e) {
    next(e);
  }
});

communityRouter.post("/posts", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({
      body: z.string().min(10).max(2000),
      tags: z.string().max(120).optional()
    });
    const requestBody = schema.parse(req.body);

    // Fetch user's profile to get city
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
      select: { city: true }
    });

    const post = await prisma.post.create({
      data: {
        userId: req.user!.id,
        body: requestBody.body,
        tags: requestBody.tags,
        city: profile?.city || null
      }
    });

    res.status(201).json({ ok: true, post });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid post: " + err.errors.map(e => e.message).join(", ")));
    } else {
      next(err);
    }
  }
});

communityRouter.post("/posts/:id/replies", requireAuth, async (req, res, next) => {
  try {
    const schema = z.object({ body: z.string().min(2).max(2000) });
    const { body } = schema.parse(req.body);

    const reply = await prisma.reply.create({
      data: { postId: req.params.id, userId: req.user!.id, body }
    });

    res.status(201).json({ ok: true, reply });
  } catch {
    next(new HttpError(400, "Invalid reply"));
  }
});

communityRouter.put("/posts/:id", requireAuth, async (req, res, next) => {
  try {
    const postId = z.string().min(1).parse(req.params.id);
    const schema = z.object({
      body: z.string().min(10).max(2000),
      tags: z.string().max(120).optional()
    });
    const requestBody = schema.parse(req.body);

    // Check if post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!existingPost) {
      return next(new HttpError(404, "Post not found"));
    }

    if (existingPost.userId !== req.user!.id) {
      return next(new HttpError(403, "You can only edit your own posts"));
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        body: requestBody.body,
        tags: requestBody.tags
      }
    });

    res.json({ ok: true, post: updatedPost });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid post: " + err.errors.map(e => e.message).join(", ")));
    } else {
      next(err);
    }
  }
});

communityRouter.delete("/posts/:id", requireAuth, async (req, res, next) => {
  try {
    const postId = z.string().min(1).parse(req.params.id);

    // Check if post exists and belongs to the user
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (!existingPost) {
      return next(new HttpError(404, "Post not found"));
    }

    if (existingPost.userId !== req.user!.id) {
      return next(new HttpError(403, "You can only delete your own posts"));
    }

    // Delete the post (replies will be cascade deleted)
    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid post ID"));
    } else {
      next(err);
    }
  }
});
