import { getDb } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
}: {
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const sql = getDb();
  const id = generateId(25);

  await sql`
    INSERT INTO "Notification" (id, "userId", type, title, message, "actionUrl", read, "createdAt")
    VALUES (${id}, ${userId}, ${type}, ${title}, ${message}, ${actionUrl || null}, false, NOW())
  `;

  return id;
}
