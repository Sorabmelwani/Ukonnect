import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";
import { listDocuments, createDocument } from "../services/documentService.js";
import { z } from "zod";
import { HttpError } from "../utils/httpError.js";
import { prisma } from "../lib/prisma.js";
import path from "path";
import fs from "fs";

export const documentsRouter = Router();

documentsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const docs = await listDocuments(req.user!.id);
    res.json({ ok: true, documents: docs });
  } catch (e) {
    next(e);
  }
});

documentsRouter.post("/upload", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");

    const schema = z.object({
      category: z.enum(["IDENTITY","VISA","FINANCE","HEALTH","EDUCATION","HOUSING","OTHER"]).optional(),
      notes: z.string().max(300).optional()
    });
    const body = schema.parse(req.body);

    const doc = await createDocument(req.user!.id, req.file, body.category as any, body.notes);
    res.status(201).json({ ok: true, document: doc });
  } catch (e) {
    next(e);
  }
});

documentsRouter.get("/:id/download", requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return next(new HttpError(404, "Document not found"));
    if (doc.userId !== req.user!.id) return next(new HttpError(403, "Forbidden"));

    const uploadDir = path.join(process.cwd(), "src", "uploads");
    const filePath = path.join(uploadDir, doc.storedName);
    if (!fs.existsSync(filePath)) return next(new HttpError(404, "File not found on server"));

    res.download(filePath, doc.originalName, (err) => {
      if (err) next(err);
    });
  } catch (e) {
    next(e);
  }
});
