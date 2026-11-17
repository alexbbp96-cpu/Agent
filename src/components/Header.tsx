interface HeaderProps {
  organization: string;
  onAskAssistant: () => void;
}

export function Header({ organization, onAskAssistant }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200 dark:bg-zinc-950/95 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          {organization}
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          <a
            href="#manifesto"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Manifesto
          </a>
          <a
            href="#projects"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Projects
          </a>
          <a
            href="#methodology"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Methodology
          </a>
          <a
            href="#assistant"
            className="hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 py-2"
          >
            Assistant
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onAskAssistant}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            Ask Assistant
          </button>
        </div>
      </div>
    </header>
  );
}
