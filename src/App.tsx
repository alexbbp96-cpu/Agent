import { useEffect, useState } from 'react';
import { DEFAULT_AICV_SCHEMA, type AICVSchema } from './data/aicv.ts';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { ManifestoSection } from './components/ManifestoSection.tsx';
import { ProjectsShowcase } from './components/ProjectsShowcase.tsx';
import {
  AssistantWorkspace,
  type AssistantTrigger,
} from './components/AssistantWorkspace.tsx';
import { SchemaInspectorModal } from './components/SchemaInspectorModal.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [schema, setSchema] = useState<AICVSchema>(DEFAULT_AICV_SCHEMA);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('soft_it_theme') === 'dark';
  });
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [assistantTrigger, setAssistantTrigger] =
    useState<AssistantTrigger | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('soft_it_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('soft_it_theme', 'light');
    }
  }, [isDark]);

  function scrollToAssistant() {
    const el = document.getElementById('assistant');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleProbeAssistant(prompt: string, focusProject = 'ALL') {
    setAssistantTrigger({
      id: Date.now(),
      prompt,
      focusProject,
      mode: 'chat',
    });
    scrollToAssistant();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
      <Header
        organization={schema.identity.organization}
        onAskAssistant={scrollToAssistant}
      />

      <main className="flex-1">
        <HeroSection
          schema={schema}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onLaunchAssistant={scrollToAssistant}
          onOpenSchema={() => setSchemaModalOpen(true)}
        />

        <ManifestoSection
          schema={schema}
          onProbeAssistant={handleProbeAssistant}
        />

        <ProjectsShowcase
          schema={schema}
          onAnalyzeProject={(projectName, prompt) =>
            handleProbeAssistant(prompt, projectName)
          }
        />

        <AssistantWorkspace schema={schema} trigger={assistantTrigger} />
      </main>

      <Footer schema={schema} onOpenSchema={() => setSchemaModalOpen(true)} />

      <SchemaInspectorModal
        isOpen={schemaModalOpen}
        schema={schema}
        onClose={() => setSchemaModalOpen(false)}
        onUpdateSchema={setSchema}
      />
    </div>
  );
}
