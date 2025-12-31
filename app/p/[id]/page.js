import { sql } from "@/lib/db";
import { getNow } from "@/lib/time";
import { notFound } from "next/navigation";
import ReadOnlyEditor from "@/components/ReadOnlyEditor";

export default async function PastePage({ params }) {
  const { id } = await params;
  const now = await getNow();

  const rows = await sql`
    UPDATE pastes
    SET view_count = view_count + 1
    WHERE id = ${id}
      AND (expires_at IS NULL OR expires_at > ${now})
      AND (max_views IS NULL OR view_count < max_views)
    RETURNING
      content,
      expires_at,
      max_views,
      view_count
  `;

  if (rows.length === 0) {
    notFound();
  }

  const paste = rows[0];

  const remainingViews =
    paste.max_views === null
      ? null
      : Math.max(paste.max_views - paste.view_count, 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-zinc-900/80 backdrop-blur rounded-xl border border-zinc-800 shadow-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold text-white text-center">
          Shared Paste
        </h1>

        <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
          {paste.expires_at && (
            <span>
              Expires at:{" "}
              <span className="text-zinc-200">
                {new Date(paste.expires_at).toLocaleString()}
              </span>
            </span>
          )}

          {remainingViews !== null && (
            <span>
              Remaining views:{" "}
              <span className="text-zinc-200">{remainingViews}</span>
            </span>
          )}
        </div>

        <ReadOnlyEditor content={paste.content} />
      </div>
    </main>
  );
}
