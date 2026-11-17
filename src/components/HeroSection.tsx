import { ArrowUpRight, FileJson, Moon, Sun } from 'lucide-react';
import type { AICVSchema } from '../data/aicv.ts';
import { HERO_VISUAL } from '../data/visuals.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface HeroSectionProps {
  schema: AICVSchema;
  isDark: boolean;
  onToggleTheme: () => void;
  onLaunchAssistant: () => void;
  onOpenSchema: () => void;
}

export function HeroSection({
  schema,
  isDark,
  onToggleTheme,
  onLaunchAssistant,
  onOpenSchema,
}: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span>{schema.schema_version}</span>
            <span aria-hidden="true">·</span>
            <span>{schema.license}</span>
            <span aria-hidden="true">·</span>
            <span>{schema.identity.location}</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[36px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Light Surface</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Dark Surface</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                {schema.identity.organization} Interactive Dossier
              </p>
              <h1
                className="font-display font-bold tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08] max-w-2xl"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                {schema.identity.role}
              </h1>
              <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-[62ch]">
                Architecting logic-first software systems, Israeli tax and accounting automation, and FinTech primitives through independent conceptual development and AI collaboration.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onLaunchAssistant}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              >
                <span>Open AI-CV Assistant</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenSchema}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <FileJson className="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                <span>Inspect JSON Schema</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-64 sm:h-80 lg:h-full min-h-[280px] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
              <ResilientImage
                src={HERO_VISUAL.src}
                alt={HERO_VISUAL.alt}
                fallbackLabel="SOFT_IT · Architectural Workspace"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Organization</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              {schema.identity.organization}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Location</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              {schema.identity.location}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Ownership Model</dt>
            <dd className="mt-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
              {schema.license}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">Direct Contact</dt>
            <dd className="mt-1 text-sm font-mono text-zinc-950 dark:text-zinc-100 truncate">
              <a
                href={`mailto:${schema.identity.contact}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 underline-offset-4 hover:underline"
              >
                {schema.identity.contact}
              </a>
            </dd>
          </div>
        </div>
      </div>
    </section>
  );
}
