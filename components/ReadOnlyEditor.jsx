"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

export default function ReadOnlyEditor({ content }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    content,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
  });

  if (!editor) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-zinc-100">
      <EditorContent editor={editor} />
    </div>
  );
}
