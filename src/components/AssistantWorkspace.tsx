import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  CornerDownLeft,
  RotateCcw,
} from 'lucide-react';
import type { AICVSchema } from '../data/aicv.ts';

export interface AssistantTrigger {
  id: number;
  prompt: string;
  focusProject: string;
  mode?: 'chat' | 'architect';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ArchitectBlueprint {
  problemStatement: string;
  logicFirstInvariants: string[];
  independentArchitecture: string[];
  aiIterativeRefinement: string[];
  integrationNotes: string;
}

interface AssistantWorkspaceProps {
  schema: AICVSchema;
  trigger: AssistantTrigger | null;
}

const QUICK_PROMPTS = [
  {
    label: 'Executive Summary',
    focus: 'ALL',
    prompt:
      'Provide a crisp executive brief of this AI-CV 1.0 profile: identity, manifesto, and active systems.',
  },
  {
    label: 'Israeli Tax Automation',
    focus: 'AUTO-TAX / TAX-BOT',
    prompt:
      'How does AUTO-TAX / TAX-BOT handle Israeli tax and accounting automation using a logic-first approach?',
  },
  {
    label: 'MAGNUM Logic Layer',
    focus: 'PROJECT ADAM',
    prompt:
      'Explain PROJECT ADAM as the MAGNUM accounting and logic layer and its key architectural invariants.',
  },
  {
    label: 'Collaboration Fit',
    focus: 'SOFT_IT',
    prompt:
      'How can a technical partner or FinTech founder collaborate with SOFT_IT on product architecture?',
  },
];

const ARCHITECT_SAMPLES = [
  {
    label: 'VAT & Receipt Reconciliation',
    focus: 'AUTO-TAX / TAX-BOT',
    challenge:
      'Automated monthly Israeli VAT and expense classification pipeline for small businesses with deterministic audit trails.',
  },
  {
    label: 'Double-Entry Payment Ledger',
    focus: 'PROJECT ADAM',
    challenge:
      'Idempotent multi-currency payment and settlement ledger layer for MAGNUM accounting with strict balance invariants.',
  },
  {
    label: 'Venture Validation Pipeline',
    focus: 'SOFT_IT',
    challenge:
      'Reusable SOFT_IT development infrastructure to take a FinTech concept from formal logic spec to working prototype in 7 days.',
  },
];

function FormattedResponse({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={index} className="h-1" />;
        }
        if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
          const cleanHeading = line.replace(/^#{1,3}\s+/, '').replace(/\*\*/g, '');
          return (
            <h4
              key={index}
              className="font-display text-base font-semibold text-zinc-950 dark:text-zinc-50 pt-1"
            >
              {cleanHeading}
            </h4>
          );
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const cleanItem = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
          return (
            <div key={index} className="flex items-start gap-2.5 pl-1">
              <span aria-hidden="true" className="text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                —
              </span>
              <span>{cleanItem}</span>
            </div>
          );
        }
        const cleanParagraph = line.replace(/\*\*(.*?)\*\*/g, '$1');
        return <p key={index}>{cleanParagraph}</p>;
      })}
    </div>
  );
}

export function AssistantWorkspace({ schema, trigger }: AssistantWorkspaceProps) {
  const [mode, setMode] = useState<'chat' | 'architect'>('chat');
  const [focusProject, setFocusProject] = useState<string>('ALL');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello — I am the ${schema.identity.organization} ${schema.schema_version} Assistant. Ask me about the founder's background in ${schema.identity.location}, core competencies across FinTech and tax automation, or explore SOFT_IT, AUTO-TAX / TAX-BOT, and PROJECT ADAM.`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [challengeInput, setChallengeInput] = useState('');
  const [blueprint, setBlueprint] = useState<ArchitectBlueprint | null>(null);
  const [architectLoading, setArchitectLoading] = useState(false);
  const [architectError, setArchitectError] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerIdRef = useRef<number>(0);

  useEffect(() => {
    if (trigger && trigger.id !== lastTriggerIdRef.current) {
      lastTriggerIdRef.current = trigger.id;
      setFocusProject(trigger.focusProject || 'ALL');
      if (trigger.mode === 'architect') {
        setMode('architect');
        setChallengeInput(trigger.prompt);
      } else {
        setMode('chat');
        void sendChatMessage(trigger.prompt, trigger.focusProject || 'ALL');
      }
    }
  }, [trigger]);

  useEffect(() => {
    if (messages.length > 1) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, chatLoading]);

  async function sendChatMessage(text: string, overrideFocus?: string) {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const activeFocus = overrideFocus ?? focusProject;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setChatInput('');
    setChatError(null);
    setChatLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          schema,
          focusProject: activeFocus,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Failed to get a response from the assistant.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply as string,
        },
      ]);
    } catch (err) {
      setChatError(
        err instanceof Error ? err.message : 'Unable to reach the assistant right now.'
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function runArchitect(customChallenge?: string, overrideFocus?: string) {
    const text = (customChallenge ?? challengeInput).trim();
    if (!text || architectLoading) return;

    const activeFocus = overrideFocus ?? focusProject;
    if (customChallenge) {
      setChallengeInput(customChallenge);
    }
    setArchitectError(null);
    setArchitectLoading(true);

    try {
      const response = await fetch('/api/assistant/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: text,
          focusProject: activeFocus,
          schema,
        }),
      });

      const data = (await response.json()) as {
        blueprint?: ArchitectBlueprint;
        error?: string;
      };
      if (!response.ok || !data.blueprint) {
        throw new Error(data.error || 'Failed to generate architecture blueprint.');
      }

      setBlueprint(data.blueprint);
    } catch (err) {
      setArchitectError(
        err instanceof Error ? err.message : 'Unable to generate blueprint right now.'
      );
    } finally {
      setArchitectLoading(false);
    }
  }

  function handleResetChat() {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I am grounded in the ${schema.schema_version} schema for ${schema.identity.organization}. What would you like to explore?`,
      },
    ]);
    setChatError(null);
  }

  async function handleCopyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard blocked in restricted context; ignore silently
    }
  }

  return (
    <section id="assistant" className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Interactive AI-CV Assistant
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Interrogate the dossier or run a logic-first design brief
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Assistant mode"
            className="inline-flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'chat'}
              onClick={() => setMode('chat')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'chat'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              Brief & Q&A
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'architect'}
              onClick={() => setMode('architect')}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'architect'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
              }`}
            >
              Logic-First Architect
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="project-focus-select"
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                Context Scope:
              </label>
              <select
                id="project-focus-select"
                value={focusProject}
                onChange={(e) => setFocusProject(e.target.value)}
                className="text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-md px-2.5 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="ALL">Full AI-CV 1.0 Schema</option>
                {schema.active_projects.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {mode === 'chat' && (
              <button
                type="button"
                onClick={handleResetChat}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer py-1 px-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset Thread</span>
              </button>
            )}
          </div>

          {mode === 'chat' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-4 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/30">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Suggested Inquiries
                </h3>
                <div className="mt-4 space-y-2.5">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      disabled={chatLoading}
                      onClick={() => {
                        setFocusProject(item.focus);
                        void sendChatMessage(item.prompt, item.focus);
                      }}
                      className="w-full text-left p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-600/50 dark:hover:border-blue-500/50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <div className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
                        {item.label}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {item.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col min-h-[460px] max-h-[600px]">
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{msg.role === 'user' ? 'You' : `${schema.identity.organization} Assistant`}</span>
                        {msg.role === 'assistant' && msg.id !== 'welcome' && (
                          <button
                            type="button"
                            onClick={() => void handleCopyText(msg.id, msg.content)}
                            aria-label="Copy assistant response"
                            className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] rounded-xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white text-sm leading-relaxed'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/70'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p>{msg.content}</p>
                        ) : (
                          <FormattedResponse text={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        {schema.identity.organization} Assistant
                      </span>
                      <div className="w-full max-w-[72%] rounded-xl px-4 py-3.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/70 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {chatError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  <div ref={threadEndRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendChatMessage(chatInput);
                  }}
                  className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center gap-3"
                >
                  <label htmlFor="assistant-chat-input" className="sr-only">
                    Ask the AI-CV Assistant
                  </label>
                  <input
                    id="assistant-chat-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about SOFT_IT, Israeli tax automation, FinTech concepts, or methodology..."
                    className="flex-1 min-w-0 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3.5 py-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <span>Send</span>
                    <CornerDownLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <label
                    htmlFor="architect-challenge-input"
                    className="block text-sm font-semibold text-zinc-950 dark:text-zinc-100"
                  >
                    Describe a product, FinTech, or accounting logic challenge
                  </label>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    The assistant decomposes your problem using the 3-stage methodology: Logic-first approach, Independent conceptual development, and AI collaboration.
                  </p>
                  <textarea
                    id="architect-challenge-input"
                    rows={3}
                    value={challengeInput}
                    onChange={(e) => setChallengeInput(e.target.value)}
                    placeholder="Example: Design an automated Israeli VAT invoice matching engine with deterministic double-entry guarantees..."
                    className="mt-3 w-full bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-950 dark:text-zinc-100 placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={architectLoading || !challengeInput.trim()}
                      onClick={() => void runArchitect()}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      {architectLoading ? 'Generating Blueprint...' : 'Generate Logic Blueprint'}
                    </button>
                    {blueprint && (
                      <button
                        type="button"
                        onClick={() => setBlueprint(null)}
                        className="px-3.5 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors min-h-[44px] cursor-pointer"
                      >
                        Clear Output
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-2.5">
                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Sample Scenarios
                  </div>
                  {ARCHITECT_SAMPLES.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      disabled={architectLoading}
                      onClick={() => {
                        setFocusProject(sample.focus);
                        void runArchitect(sample.challenge, sample.focus);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 hover:border-blue-600/50 dark:hover:border-blue-500/50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-950 dark:text-zinc-100">
                        <span>{sample.label}</span>
                        <span className="font-mono text-zinc-400">{sample.focus}</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {sample.challenge}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {architectError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-200"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{architectError}</span>
                </div>
              )}

              {architectLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  {[0, 1, 2].map((col) => (
                    <div
                      key={col}
                      className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800/70 rounded animate-pulse" />
                      <div className="h-3 w-5/6 bg-zinc-100 dark:bg-zinc-800/70 rounded animate-pulse" />
                      <div className="h-3 w-4/6 bg-zinc-100 dark:bg-zinc-800/70 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              )}

              {blueprint && !architectLoading && (
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
                  <div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Problem Definition
                    </div>
                    <p className="mt-1.5 text-base font-medium text-zinc-950 dark:text-zinc-100 leading-relaxed">
                      {blueprint.problemStatement}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
                      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        01 · Logic-first approach
                      </div>
                      <h4 className="mt-2 font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
                        Formal Invariants
                      </h4>
                      <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {blueprint.logicFirstInvariants.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-blue-600 dark:text-blue-400 font-mono">
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
                      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        02 · Independent conceptual development
                      </div>
                      <h4 className="mt-2 font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
                        System Boundaries
                      </h4>
                      <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {blueprint.independentArchitecture.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-blue-600 dark:text-blue-400 font-mono">
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
                      <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        03 · AI collaboration & refinement
                      </div>
                      <h4 className="mt-2 font-display text-base font-semibold text-zinc-950 dark:text-zinc-50">
                        Iterative Acceleration
                      </h4>
                      <ul className="mt-3 space-y-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {blueprint.aiIterativeRefinement.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span aria-hidden="true" className="text-blue-600 dark:text-blue-400 font-mono">
                              —
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                      Ecosystem Alignment:{' '}
                    </span>
                    {blueprint.integrationNotes}
                  </div>
                </div>
              )}

              {!blueprint && !architectLoading && !architectError && (
                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                  Select a sample scenario or enter a custom problem above to generate a structured 3-stage logic blueprint.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
