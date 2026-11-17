import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { DEFAULT_AICV_SCHEMA, PROJECT_BRIEFS } from './src/data/aicv.ts';
import type { AICVSchema } from './src/data/aicv.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const MODEL_ID = 'gemini-4-hydrogen';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your key in Settings > Secrets to enable live AI-CV Assistant responses.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatSchemaContext(schema: AICVSchema, focusProject?: string): string {
  const projectNote =
    focusProject && focusProject !== 'ALL' && PROJECT_BRIEFS[focusProject]
      ? `\nActive focus project selected by user: ${focusProject} — ${PROJECT_BRIEFS[focusProject].summary}\nArchitecture points: ${PROJECT_BRIEFS[focusProject].architectureFocus.join('; ')}`
      : '';

  return [
    'You are the dedicated AI-CV 1.0 Assistant representing the following user-owned professional profile and product architecture:',
    JSON.stringify(schema, null, 2),
    projectNote,
    'Guidelines:',
    '- Stay strictly grounded in the AI-CV 1.0 schema and domains provided above (SOFT_IT, AUTO-TAX / TAX-BOT in Israel, PROJECT ADAM / MAGNUM accounting & logic layer, FinTech & payment systems, logic-first design).',
    '- Do NOT invent past employers, degrees, client names, or fabricated metrics that are not in the schema.',
    '- When asked conceptual or architectural questions (e.g., about Israeli tax/accounting automation, payment flows, or logical systems design), reason clearly using the Methodology: (1) Logic-first approach, (2) Independent conceptual development, (3) AI collaboration and iterative refinement.',
    '- Keep answers sharp, structured, practical, and aligned with the Manifesto ("1. Who I am. 2. How I think. 3. What I create.").',
  ].join('\n\n');
}

function sanitizeSchema(raw: unknown): AICVSchema {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_AICV_SCHEMA;
  }
  const obj = raw as Partial<AICVSchema>;
  return {
    schema_version: typeof obj.schema_version === 'string' ? obj.schema_version : DEFAULT_AICV_SCHEMA.schema_version,
    license: typeof obj.license === 'string' ? obj.license : DEFAULT_AICV_SCHEMA.license,
    identity: {
      contact: obj.identity?.contact || DEFAULT_AICV_SCHEMA.identity.contact,
      role: obj.identity?.role || DEFAULT_AICV_SCHEMA.identity.role,
      organization: obj.identity?.organization || DEFAULT_AICV_SCHEMA.identity.organization,
      location: obj.identity?.location || DEFAULT_AICV_SCHEMA.identity.location,
    },
    core_competencies: Array.isArray(obj.core_competencies) && obj.core_competencies.length > 0
      ? obj.core_competencies.map(String)
      : DEFAULT_AICV_SCHEMA.core_competencies,
    active_projects: Array.isArray(obj.active_projects) && obj.active_projects.length > 0
      ? obj.active_projects.map((p) => ({
          name: String(p?.name ?? 'Untitled Project'),
          domain: String(p?.domain ?? ''),
        }))
      : DEFAULT_AICV_SCHEMA.active_projects,
    methodology: Array.isArray(obj.methodology) && obj.methodology.length > 0
      ? obj.methodology.map(String)
      : DEFAULT_AICV_SCHEMA.methodology,
    manifesto: Array.isArray(obj.manifesto) && obj.manifesto.length > 0
      ? obj.manifesto.map(String)
      : DEFAULT_AICV_SCHEMA.manifesto,
  };
}

function extractErrorStatusAndMessage(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : 'Unexpected server error';
  const lower = rawMessage.toLowerCase();
  if (lower.includes('gemini_api_key is not configured')) {
    return { status: 503, message: rawMessage };
  }
  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message: 'The configured GEMINI_API_KEY was rejected. Please verify your key in Settings > Secrets.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message: 'API rate limit reached. Please wait a moment and try again.',
    };
  }
  return { status: 500, message: rawMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, schema_version: DEFAULT_AICV_SCHEMA.schema_version });
  });

  app.get('/api/schema', (_req: Request, res: Response) => {
    res.json(DEFAULT_AICV_SCHEMA);
  });

  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const { messages, schema, focusProject } = req.body as {
        messages?: ChatTurn[];
        schema?: unknown;
        focusProject?: string;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'At least one message is required.' });
        return;
      }

      const cleanSchema = sanitizeSchema(schema);
      const ai = createGeminiClient();

      const contents = messages.slice(-12).map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(turn.content || '').slice(0, 4000) }],
      }));

      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents,
        config: {
          systemInstruction: formatSchemaContext(cleanSchema, focusProject),
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'The assistant returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply, model: MODEL_ID });
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/assistant/architect', async (req: Request, res: Response) => {
    try {
      const { challenge, focusProject, schema } = req.body as {
        challenge?: string;
        focusProject?: string;
        schema?: unknown;
      };

      const cleanChallenge = String(challenge || '').trim();
      if (!cleanChallenge) {
        res.status(400).json({ error: 'Please provide a product, FinTech, or tax automation challenge to architect.' });
        return;
      }

      const cleanSchema = sanitizeSchema(schema);
      const ai = createGeminiClient();

      const prompt = [
        `Apply the owner's 3-step methodology (${cleanSchema.methodology.join(' -> ')}) to the following challenge:`,
        `Challenge: "${cleanChallenge}"`,
        focusProject && focusProject !== 'ALL' ? `Target project context: ${focusProject}` : 'Target context: General SOFT_IT ecosystem',
        'Return a crisp, non-generic architectural decomposition grounded in logical systems design, FinTech/payment precision, or Israeli tax/accounting automation where relevant.',
      ].join('\n\n');

      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: prompt,
        config: {
          systemInstruction: formatSchemaContext(cleanSchema, focusProject),
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problemStatement: {
                type: Type.STRING,
                description: 'Concise restatement of the core problem and system boundary.',
              },
              logicFirstInvariants: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 formal invariants or logical rules that must never break.',
              },
              independentArchitecture: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 first-principles architectural components without unnecessary bloat.',
              },
              aiIterativeRefinement: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 concrete steps where AI collaboration accelerates testing, classification, or delivery.',
              },
              integrationNotes: {
                type: Type.STRING,
                description: 'How this aligns with SOFT_IT, AUTO-TAX / TAX-BOT, or PROJECT ADAM.',
              },
            },
            required: [
              'problemStatement',
              'logicFirstInvariants',
              'independentArchitecture',
              'aiIterativeRefinement',
              'integrationNotes',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({ blueprint: parsed, model: MODEL_ID });
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOFT_IT AI-CV 1.0 server listening on http://localhost:${PORT}`);
  });
}

startServer();
