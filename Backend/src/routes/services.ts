import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";

export const servicesRouter = Router();

servicesRouter.get("/", async (req, res, next) => {
  try {
    const schema = z.object({
      city: z.string().optional(),
      category: z.enum(["BANK", "EDUCATION", "GP", "HOSPITAL", "LOCAL COUNCIL", "MOBILE", "TRANSPORT"]).optional(),
      q: z.string().optional()
    });
    const q = schema.parse(req.query);
    console.log("Query:", q);

    const services = await prisma.localService.findMany({
      where: {
        ...(q.city ? { city: { contains: q.city } } : {}),
        ...(q.category ? { category: q.category as any } : {}),
        ...(q.q ? { name: { contains: q.q } } : {})
      },
      orderBy: { name: "asc" },
      take: 50
    });

    res.json({ ok: true, services });
  } catch (err) {
    if (err instanceof z.ZodError) {
      next(new HttpError(400, "Invalid query parameters: " + err.errors.map(e => e.message).join(", ")));
    } else {
      next(err);
    }
  }
});
