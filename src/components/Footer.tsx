import { useState } from 'react';
import { Check, Copy, FileJson } from 'lucide-react';
import type { AICVSchema } from '../data/aicv.ts';

interface FooterProps {
  schema: AICVSchema;
  onOpenSchema: () => void;
}

export function Footer({ schema, onOpenSchema }: FooterProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(schema.identity.contact);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  }

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="font-display text-base font-bold text-zinc-950 dark:text-zinc-50">
            {schema.identity.organization}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {schema.schema_version} · {schema.license} · {schema.identity.location}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => void handleCopyEmail()}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1.5"
          >
            {copiedEmail ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Copied {schema.identity.contact}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{schema.identity.contact}</span>
              </>
            )}
          </button>

          <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
            /
          </span>

          <button
            type="button"
            onClick={onOpenSchema}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1.5"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Open JSON Schema</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
