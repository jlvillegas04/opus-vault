import { MarkdownDropzone } from "@/components/import/markdown-dropzone";

export const metadata = { title: "Import | Opus Vault" };

export default function ImportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Markdown</h1>
        <p className="text-muted-foreground mt-1">
          Import notes from Obsidian or any Markdown file. Frontmatter{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">title</code> is used as the note
          title; falls back to the first H1 heading or the filename.
        </p>
      </div>
      <MarkdownDropzone />
    </div>
  );
}
