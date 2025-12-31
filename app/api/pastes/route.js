import { sql } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.content === undefined || body.content === null) {
    return Response.json({ error: "Content is missing" }, { status: 400 });
  }

  if (typeof body.content !== "string") {
    return Response.json(
      { error: "Content must be a string" },
      { status: 400 }
    );
  }

  if (
    body.ttl_seconds !== undefined &&
    (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1)
  ) {
    return Response.json({ error: "invalid ttl_seconds" }, { status: 400 });
  }

  if (
    body.max_views !== undefined &&
    (!Number.isInteger(body.max_views) || body.max_views < 1)
  ) {
    return Response.json({ error: "invalid max_views" }, { status: 400 });
  }

  const id = randomUUID();
  const expiresAt = body.ttl_seconds
    ? new Date(Date.now() + body.ttl_seconds * 1000)
    : null;

  await sql`
    INSERT INTO pastes (id, content, expires_at, max_views)
    VALUES (${id}, ${body.content}, ${expiresAt}, ${body.max_views ?? null})
  `;

  const baseUrl = process.env.HOST;
  return Response.json(
    {
      id,
      url: `${baseUrl}/p/${id}`,
    },
    { status: 201 }
  );
}
