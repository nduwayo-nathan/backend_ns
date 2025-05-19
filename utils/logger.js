import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const logAction = async (userId, action) => {
  try {
    await prisma.log.create({
      data: {
        userId,
        action,
      },
    });
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
};
