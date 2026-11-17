import { ArrowRight } from 'lucide-react';
import {
  COMPETENCY_BRIEFS,
  METHODOLOGY_DETAILS,
  type AICVSchema,
} from '../data/aicv.ts';

interface ManifestoSectionProps {
  schema: AICVSchema;
  onProbeAssistant: (prompt: string, focusProject?: string) => void;
}

export function ManifestoSection({ schema, onProbeAssistant }: ManifestoSectionProps) {
  const manifestoChapters = [
    {
      index: '01',
      title: schema.manifesto[0]?.replace(/^1\.\s*/, '') || 'Who I am.',
      subtitle: 'Identity & Ownership',
      narrative: `${schema.identity.role} leading ${schema.identity.organization} from ${schema.identity.location}. Committed to transparent, user-owned software architecture where systems remain intelligible to the people who build and operate them.`,
      prompt: 'Summarize who is behind SOFT_IT, their core identity, and why Open Source / User-Owned design matters here.',
    },
    {
      index: '02',
      title: schema.manifesto[1]?.replace(/^2\.\s*/, '') || 'How I think.',
      subtitle: 'Logic-First Cognition',
      narrative:
        'Every venture begins with invariant logic and clear domain boundaries before frameworks or interfaces. AI acts as a rigorous partner for stress-testing assumptions and accelerating refinement.',
      prompt: 'Explain the "How I think" philosophy: logic-first approach, independent conceptual development, and AI collaboration.',
    },
    {
      index: '03',
      title: schema.manifesto[2]?.replace(/^3\.\s*/, '') || 'What I create.',
      subtitle: 'Applied Infrastructure',
      narrative:
        'Purpose-built software infrastructure, Israeli tax and accounting automation (AUTO-TAX / TAX-BOT), and foundational accounting logic layers (PROJECT ADAM / MAGNUM).',
      prompt: 'Give an overview of what is being created across SOFT_IT, AUTO-TAX / TAX-BOT, and PROJECT ADAM.',
    },
  ];

  return (
    <section id="manifesto" className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Manifesto & Capabilities
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Three questions that anchor every system
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {manifestoChapters.map((chapter) => (
            <div
              key={chapter.index}
              className="flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">
                  <span>{chapter.index}</span>
                  <span>{chapter.subtitle}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {chapter.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {chapter.narrative}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onProbeAssistant(chapter.prompt, 'ALL')}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer self-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm py-1"
              >
                <span>Explore with assistant</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-12 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <h3 className="font-display text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              Core Competencies
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Select any competency to ask the AI-CV Assistant how it applies to current architectures.
            </p>
          </div>

          <div className="lg:col-span-7 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-b border-zinc-200 dark:border-zinc-800">
            {schema.core_competencies.map((comp, idx) => {
              const brief = COMPETENCY_BRIEFS[comp];
              const prompt =
                brief?.prompt ||
                `Explain how "${comp}" is applied across SOFT_IT projects.`;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => onProbeAssistant(prompt, 'ALL')}
                  className="w-full py-4 px-2 flex items-start justify-between gap-4 text-left hover:bg-zinc-100/70 dark:hover:bg-zinc-900/70 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 tabular-nums shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="text-sm sm:text-base font-semibold text-zinc-950 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {comp}
                      </span>
                    </div>
                    {brief?.detail && (
                      <p className="mt-1 pl-7 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {brief.detail}
                      </p>
                    )}
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div id="methodology" className="mt-14 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Execution Methodology
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                From invariant logic to shipped product
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {schema.methodology.length} sequential stages · Logic before tooling
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {schema.methodology.map((method, idx) => {
              const detail = METHODOLOGY_DETAILS[idx];
              return (
                <div
                  key={method}
                  className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                    Stage 0{idx + 1}
                  </div>
                  <h4 className="mt-3 font-display text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {method}
                  </h4>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {detail?.description ||
                      'Iterative conceptual modeling and precision engineering powered by structured AI collaboration.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
