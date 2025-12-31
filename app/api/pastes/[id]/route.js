import { sql } from "@/lib/db";
import { getNow } from "@/lib/time";
import { NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req, { params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid paste id" }, { status: 404 });
  }

  const now = await getNow();

  const rows = await sql`
    UPDATE pastes
    SET view_count = view_count + 1
    WHERE id = ${id}
      AND (expires_at IS NULL OR expires_at > ${now})
      AND (max_views IS NULL OR view_count < max_views)
    RETURNING content, expires_at, max_views, view_count
  `;

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Paste not found or expired" },
      { status: 404 }
    );
  }

  const paste = rows[0];

  return NextResponse.json({
    content: paste.content,
    remaining_views:
      paste.max_views === null ? null : paste.max_views - paste.view_count,
    expires_at: paste.expires_at,
  });
}
