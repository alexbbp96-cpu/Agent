import { useEffect, useState } from 'react';
import { AlertCircle, Check, Copy, Download, RotateCcw, X } from 'lucide-react';
import { DEFAULT_AICV_SCHEMA, type AICVSchema } from '../data/aicv.ts';

interface SchemaInspectorModalProps {
  isOpen: boolean;
  schema: AICVSchema;
  onClose: () => void;
  onUpdateSchema: (next: AICVSchema) => void;
}

export function SchemaInspectorModal({
  isOpen,
  schema,
  onClose,
  onUpdateSchema,
}: SchemaInspectorModalProps) {
  const [draft, setDraft] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(JSON.stringify(schema, null, 2));
      setParseError(null);
    }
  }, [isOpen, schema]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleApply() {
    try {
      const parsed = JSON.parse(draft) as AICVSchema;
      if (!parsed || typeof parsed !== 'object' || !parsed.identity || !Array.isArray(parsed.active_projects)) {
        throw new Error('Schema must preserve identity object and active_projects array.');
      }
      setParseError(null);
      onUpdateSchema(parsed);
      onClose();
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON syntax.');
    }
  }

  function handleReset() {
    const formatted = JSON.stringify(DEFAULT_AICV_SCHEMA, null, 2);
    setDraft(formatted);
    setParseError(null);
    onUpdateSchema(DEFAULT_AICV_SCHEMA);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  }

  function handleDownload() {
    const blob = new Blob([draft], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-cv-1.0.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <h2
              id="schema-modal-title"
              className="font-display text-lg font-bold text-zinc-950 dark:text-zinc-50"
            >
              User-Owned AI-CV 1.0 JSON Schema
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {schema.license} · Edits immediately update the live AI-CV Assistant context
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close JSON schema inspector"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <textarea
            aria-label="AI-CV JSON source"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            rows={18}
            className="w-full font-mono text-xs leading-relaxed bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />

          {parseError && (
            <div
              role="alert"
              className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[40px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[40px] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 rounded-lg transition-colors min-h-[40px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[40px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors min-h-[40px] cursor-pointer"
            >
              Apply to Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
