"use client";

import { useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";

import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";

/* ---------------- LOWLIGHT ---------------- */
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("json", json);

/* ---------------- TABLE TOOLBAR ---------------- */
function TableToolbar({ editor }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const update = () => setVisible(editor.isActive("table"));
    editor.on("selectionUpdate", update);

    return () => editor.off("selectionUpdate", update);
  }, [editor]);

  if (!editor || !visible) return null;

  return (
    <div className="sticky top-[56px] z-20 bg-zinc-900 border-b border-zinc-700">
      <div className="flex flex-nowrap gap-2 px-3 py-2 overflow-x-auto">
        <button
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          className="table-btn"
        >
          + Col Before
        </button>
        <button
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          className="table-btn"
        >
          + Col After
        </button>
        <button
          onClick={() => editor.chain().focus().deleteColumn().run()}
          className="table-btn"
        >
          − Col
        </button>
        <button
          onClick={() => editor.chain().focus().addRowBefore().run()}
          className="table-btn"
        >
          + Row Above
        </button>
        <button
          onClick={() => editor.chain().focus().addRowAfter().run()}
          className="table-btn"
        >
          + Row Below
        </button>
        <button
          onClick={() => editor.chain().focus().deleteRow().run()}
          className="table-btn"
        >
          − Row
        </button>
        <button
          onClick={() => editor.chain().focus().deleteTable().run()}
          className="table-btn danger"
        >
          Delete Table
        </button>
      </div>

      <style jsx>{`
        .table-btn {
          white-space: nowrap;
          background: #3f3f46;
          padding: 6px 12px;
          border-radius: 6px;
          color: white;
          font-weight: 500;
          transition: background 0.15s ease;
        }
        .table-btn:hover {
          background: #52525b;
        }
        .table-btn.danger {
          background: #7f1d1d;
        }
        .table-btn.danger:hover {
          background: #991b1b;
        }
      `}</style>
    </div>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */
export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [useExpiry, setUseExpiry] = useState(false);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("");

  const [useViews, setUseViews] = useState(false);
  const [views, setViews] = useState("");

  /* ---------------- TIPTAP ---------------- */
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none w-full p-3",
      },
    },
  });

  function computeTTLSeconds() {
    if (!useExpiry || !date || !time) return null;
    const [y, m, d] = date.split("-").map(Number);
    const [h, min, sec = 0] = time.split(":").map(Number);
    const expiry = new Date(y, m - 1, d, h, min, sec);
    const now = new Date();
    if (expiry <= now) return null;
    return Math.floor((expiry - now) / 1000);
  }

  async function submit() {
    if (!editor) return;

    const content = editor.getHTML();
    const ttlSeconds = computeTTLSeconds();

    if (useExpiry && !ttlSeconds) {
      alert("Please select a future expiry date and time.");
      return;
    }

    setLoading(true);
    setUrl("");

    const payload = {
      content,
      ...(ttlSeconds && { ttl_seconds: ttlSeconds }),
      ...(useViews && views && { max_views: Number(views) }),
    };

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setUrl(data.url);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    editor?.commands.clearContent();
    setUseExpiry(false);
    setDate(today);
    setTime("");
    setUseViews(false);
    setViews("");
    setUrl("");
    setCopied(false);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const minTime =
    date === today ? new Date().toISOString().slice(11, 16) : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 flex justify-center p-4">
      <div className="w-full max-w-5xl bg-zinc-900/80 backdrop-blur rounded-xl border border-zinc-800 shadow-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-white text-center">
          Pastebin Lite
        </h1>

        {!url && (
          <>
            {/* TEXT TOOLBAR */}
            {editor && (
              <div className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-700 flex flex-wrap gap-2 p-2">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="btn"
                >
                  Bold
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className="btn"
                >
                  Italic
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className="btn"
                >
                  Strike
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className="btn"
                >
                  H1
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className="btn"
                >
                  H2
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className="btn"
                >
                  H3
                </button>
                <button
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className="btn"
                >
                  List
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className="btn"
                >
                  Code
                </button>
                <button
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertTable({ rows: 2, cols: 2 })
                      .run()
                  }
                  className="btn"
                >
                  Table
                </button>
                <button
                  onClick={() => {
                    const href = prompt("Enter URL");
                    if (href) editor.chain().focus().toggleLink({ href }).run();
                  }}
                  className="btn"
                >
                  Link
                </button>
              </div>
            )}

            {/* TABLE TOOLBAR */}
            <TableToolbar editor={editor} />

            {/* EDITOR */}
            <div className="bg-zinc-950 border border-zinc-700 rounded-md max-h-[450px] overflow-auto">
              <EditorContent editor={editor} />
            </div>

            {/* EXPIRY */}
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={useExpiry}
                  onChange={() => setUseExpiry(!useExpiry)}
                  className="accent-indigo-500"
                />
                Add expiry
              </label>

              {useExpiry && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input"
                  />
                  <input
                    type="time"
                    step="1"
                    min={minTime}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* VIEW LIMIT */}
            <div>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={useViews}
                  onChange={() => setUseViews(!useViews)}
                  className="accent-indigo-500"
                />
                Limit views
              </label>

              {useViews && (
                <input
                  type="number"
                  min="1"
                  value={views}
                  onChange={(e) => setViews(e.target.value)}
                  className="input w-full mt-2"
                />
              )}
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-md text-white"
            >
              {loading ? "Creating..." : "Create Paste"}
            </button>
          </>
        )}

        {url && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 space-y-3">
            <p className="text-zinc-400">Shareable URL</p>
            <div className="flex gap-2">
              <a
                href={url}
                target="_blank"
                className="text-indigo-400 break-all flex-1"
              >
                {url}
              </a>
              <button onClick={copyToClipboard} className="btn">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <button
              onClick={resetForm}
              className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-md text-white"
            >
              Create New Paste
            </button>
          </div>
        )}

        <style jsx>{`
          .btn {
            background: #3f3f46;
            padding: 6px 10px;
            border-radius: 6px;
            color: white;
          }
          .btn:hover {
            background: #52525b;
          }
          .input {
            background: #09090b;
            border: 1px solid #3f3f46;
            border-radius: 6px;
            padding: 8px;
            color: white;
          }
        `}</style>
      </div>
    </main>
  );
}
