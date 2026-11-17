export interface AICVIdentity {
  contact: string;
  role: string;
  organization: string;
  location: string;
}

export interface AICVProject {
  name: string;
  domain: string;
}

export interface AICVSchema {
  schema_version: string;
  license: string;
  identity: AICVIdentity;
  core_competencies: string[];
  active_projects: AICVProject[];
  methodology: string[];
  manifesto: string[];
}

export const DEFAULT_AICV_SCHEMA: AICVSchema = {
  schema_version: 'AI-CV 1.0',
  license: 'Open Source / User-Owned',
  identity: {
    contact: 'alexbbp96@gmail.com',
    role: 'AI-Assisted Entrepreneur / Product Visionary',
    organization: 'SOFT_IT',
    location: 'Israel',
  },
  core_competencies: [
    'Product vision and conceptual architecture',
    'AI-assisted business development',
    'Tax and accounting automation',
    'FinTech and payment-system concepts',
    'Logical systems design',
  ],
  active_projects: [
    {
      name: 'SOFT_IT',
      domain: 'Software business and development infrastructure',
    },
    {
      name: 'AUTO-TAX / TAX-BOT',
      domain: 'AI-assisted tax and accounting automation (Israel)',
    },
    {
      name: 'PROJECT ADAM',
      domain: 'MAGNUM accounting and logic layer',
    },
  ],
  methodology: [
    'Logic-first approach',
    'Independent conceptual development',
    'AI collaboration and iterative refinement',
  ],
  manifesto: [
    '1. Who I am.',
    '2. How I think.',
    '3. What I create.',
  ],
};

export interface ProjectBrief {
  name: string;
  domain: string;
  summary: string;
  architectureFocus: string[];
  starterPrompt: string;
}

export const PROJECT_BRIEFS: Record<string, ProjectBrief> = {
  SOFT_IT: {
    name: 'SOFT_IT',
    domain: 'Software business and development infrastructure',
    summary:
      'Foundational venture and engineering studio supplying reusable software infrastructure, AI-accelerated delivery pipelines, and conceptual product architecture.',
    architectureFocus: [
      'Modular development infrastructure for rapid venture validation',
      'User-owned tooling and transparent system boundaries',
      'AI-assisted specification, verification, and business orchestration',
    ],
    starterPrompt:
      'Explain how SOFT_IT structures its software business and development infrastructure to take a concept from logic design to production.',
  },
  'AUTO-TAX / TAX-BOT': {
    name: 'AUTO-TAX / TAX-BOT',
    domain: 'AI-assisted tax and accounting automation (Israel)',
    summary:
      'Domain-specific automation engine built for Israeli tax compliance, recurring accounting workflows, and structured financial classification without brittle manual overhead.',
    architectureFocus: [
      'Deterministic rule validation paired with AI document interpretation',
      'Israeli regulatory alignment for receipts, VAT, and periodic filings',
      'Audit-ready ledger trails with human-in-the-loop review gates',
    ],
    starterPrompt:
      'Walk through the conceptual architecture of AUTO-TAX / TAX-BOT for Israeli tax and accounting automation.',
  },
  'PROJECT ADAM': {
    name: 'PROJECT ADAM',
    domain: 'MAGNUM accounting and logic layer',
    summary:
      'Core semantic and mathematical logic layer powering MAGNUM accounting—enforcing double-entry invariants, state transitions, and composable financial rules.',
    architectureFocus: [
      'Logic-first double-entry invariant engine and ledger state machine',
      'Separation of pure accounting rules from transport and UI surfaces',
      'Composable payment and FinTech integration primitives',
    ],
    starterPrompt:
      'Describe the role of PROJECT ADAM as the MAGNUM accounting and logic layer and why a logic-first design matters here.',
  },
};

export const COMPETENCY_BRIEFS: Record<string, { detail: string; prompt: string }> = {
  'Product vision and conceptual architecture': {
    detail:
      'Translating ambiguous market needs into coherent system boundaries, clear user value, and durable product primitives before writing code.',
    prompt: 'How do you approach product vision and conceptual architecture before building?',
  },
  'AI-assisted business development': {
    detail:
      'Leveraging AI models as structured thought partners for market synthesis, venture scoping, technical prototyping, and operational leverage.',
    prompt: 'How does AI-assisted business development fit into SOFT_IT workflows?',
  },
  'Tax and accounting automation': {
    detail:
      'Designing deterministic and AI-augmented workflows for Israeli tax compliance, bookkeeping classification, and zero-friction financial reporting.',
    prompt: 'What are the core challenges in Israeli tax and accounting automation that AUTO-TAX addresses?',
  },
  'FinTech and payment-system concepts': {
    detail:
      'Architecting payment flows, reconciliation pipelines, and compliant ledger abstractions tailored for modern financial products.',
    prompt: 'What FinTech and payment-system concepts are central to your architecture work?',
  },
  'Logical systems design': {
    detail:
      'Building from formal invariants, explicit state machines, and unambiguous data contracts so complex software remains predictable and maintainable.',
    prompt: 'How does logical systems design guide PROJECT ADAM and your other systems?',
  },
};

export const METHODOLOGY_DETAILS: Array<{
  step: string;
  title: string;
  description: string;
  manifestoLink: string;
}> = [
  {
    step: '01',
    title: 'Logic-first approach',
    description:
      'Define invariants, domain rules, and edge-case semantics up front. Interfaces and storage adapt to the logic—never the reverse.',
    manifestoLink: '1. Who I am.',
  },
  {
    step: '02',
    title: 'Independent conceptual development',
    description:
      'Reason from first principles without cargo-culting industry bloat. Every module earns its complexity through direct utility.',
    manifestoLink: '2. How I think.',
  },
  {
    step: '03',
    title: 'AI collaboration and iterative refinement',
    description:
      'Treat AI as a high-bandwidth reasoning and execution multiplier—iterating rapidly across architecture, edge cases, and implementation.',
    manifestoLink: '3. What I create.',
  },
];
