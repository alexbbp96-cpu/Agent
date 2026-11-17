import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PROJECT_BRIEFS, type AICVSchema } from '../data/aicv.ts';
import { PROJECT_VISUALS } from '../data/visuals.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface ProjectsShowcaseProps {
  schema: AICVSchema;
  onAnalyzeProject: (projectName: string, prompt: string) => void;
}

export function ProjectsShowcase({ schema, onAnalyzeProject }: ProjectsShowcaseProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filteredProjects =
    selectedFilter === 'ALL'
      ? schema.active_projects
      : schema.active_projects.filter((p) => p.name === selectedFilter);

  return (
    <section id="projects" className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Active Projects
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Systems currently in active development
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter active projects"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedFilter === 'ALL'}
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              All Projects
            </button>
            {schema.active_projects.map((project) => (
              <button
                key={project.name}
                type="button"
                role="tab"
                aria-selected={selectedFilter === project.name}
                onClick={() => setSelectedFilter(project.name)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedFilter === project.name
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`mt-10 grid gap-6 ${
            filteredProjects.length === 1
              ? 'grid-cols-1'
              : 'grid-cols-1 lg:grid-cols-3'
          }`}
        >
          {filteredProjects.map((project, idx) => {
            const brief = PROJECT_BRIEFS[project.name];
            const visual = PROJECT_VISUALS[project.name];
            const isExpandedSingle = filteredProjects.length === 1;
            const starterPrompt =
              brief?.starterPrompt ||
              `Explain the architecture and domain scope of ${project.name} (${project.domain}).`;

            return (
              <article
                key={project.name}
                className={`rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex ${
                  isExpandedSingle ? 'flex-col lg:flex-row' : 'flex-col'
                }`}
              >
                <div
                  className={
                    isExpandedSingle
                      ? 'lg:w-5/12 aspect-[4/3] lg:aspect-auto bg-zinc-100 dark:bg-zinc-950 shrink-0'
                      : 'aspect-[4/3] bg-zinc-100 dark:bg-zinc-950'
                  }
                >
                  <ResilientImage
                    src={visual?.src || ''}
                    alt={visual?.alt || `${project.name} visual`}
                    fallbackLabel={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-mono tabular-nums">0{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{project.domain}</span>
                    </div>

                    <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {project.name}
                    </h3>

                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {brief?.summary ||
                        `Active venture focused on ${project.domain} within the ${schema.identity.organization} ecosystem.`}
                    </p>

                    {brief?.architectureFocus && (
                      <ul className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                        {brief.architectureFocus.map((point) => (
                          <li
                            key={point}
                            className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex items-start gap-2"
                          >
                            <span
                              aria-hidden="true"
                              className="text-blue-600 dark:text-blue-400 font-mono mt-0.5"
                            >
                              —
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => onAnalyzeProject(project.name, starterPrompt)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm py-1"
                    >
                      <span>Analyze in assistant</span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
