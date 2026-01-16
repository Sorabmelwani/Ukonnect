import { prisma } from "../lib/prisma.js";

export type DocumentCategory =
  | "IDENTITY"
  | "VISA"
  | "FINANCE"
  | "HEALTH"
  | "EDUCATION"
  | "HOUSING"
  | "OTHER";

export async function listDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDocument(
  userId: string,
  file: { originalname: string; filename: string; mimetype: string; size: number },
  category?: DocumentCategory,
  notes?: string
) {
  return prisma.document.create({
    data: {
      userId,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      category: category ?? "OTHER",
      notes,
    },
  });
}
