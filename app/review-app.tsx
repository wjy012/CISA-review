'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Eye,
  Flag,
  Home,
  Layers3,
  ListChecks,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

import questionsJson from './questions.json';

type Option = { key: string; text: string };
type Question = {
  id: string;
  title: string;
  domainId: string;
  domainName: string;
  knowledgePoint: string;
  stem: string;
  options: Option[];
  originalAnswer: string | null;
  correctAnswer: string;
  bankAnswer: string | null;
  principleAnswer: string | null;
  tags: string[];
  explanation: string;
  wrongCause: string;
  correction: string;
  flags: {
    guessedCorrect: boolean;
    disputedAnswer: boolean;
    legacyContext: boolean;
    malformedStem: boolean;
  };
};

type View = 'home' | 'map' | 'questions';
type ReviewEntry = {
  attempts: number;
  correctStreak: number;
  lastAnswer: string;
  lastCorrect: boolean;
  unsure: boolean;
  lastReviewedAt: string;
};
type ReviewProgress = Record<string, ReviewEntry>;
type SessionResult = {
  questionId: string;
  selected: string;
  correct: boolean;
  unsure: boolean;
  disputed: boolean;
};
type ReviewSession = {
  queue: string[];
  index: number;
  results: SessionResult[];
};

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): unknown;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: WebMcpTool, options?: { signal?: AbortSignal }): void | Promise<void>;
    };
  }
}

const questions = questionsJson as Question[];
const questionById = new Map(questions.map((question) => [question.id, question]));

const domains = [
  { id: 'D1', name: '信息系统审计过程', count: 12, weight: '18%', critical: 3 },
  { id: 'D2', name: 'IT 治理与管理', count: 13, weight: '18%', critical: 3 },
  { id: 'D3', name: '获取、开发与实施', count: 18, weight: '12%', critical: 5 },
  { id: 'D4', name: '系统运营与业务韧性', count: 16, weight: '26%', critical: 4 },
  { id: 'D5', name: '信息资产保护', count: 20, weight: '26%', critical: 2 },
];

const priorityQueue = [
  'WQ-001',
  'WQ-039',
  'WQ-017',
  'WQ-004',
  'WQ-035',
  'WQ-025',
  'WQ-060',
  'WQ-062',
  'WQ-076',
  'WQ-079',
];

const patterns = [
  {
    title: '控制目标、风险发生点与控制边界',
    severity: '重点薄弱',
    count: 23,
    principle: '先写出“风险事件—对象层级—直接影响—控制目标”，再评价选项。',
    ids: ['WQ-001', 'WQ-003', 'WQ-004', 'WQ-008', 'WQ-011', 'WQ-015', 'WQ-021', 'WQ-025', 'WQ-026', 'WQ-028', 'WQ-029', 'WQ-031', 'WQ-039', 'WQ-048', 'WQ-053', 'WQ-062', 'WQ-066', 'WQ-073', 'WQ-075', 'WQ-076', 'WQ-077', 'WQ-078', 'WQ-079'],
  },
  {
    title: '制度定义与实际履职证据',
    severity: '重点薄弱',
    count: 6,
    principle: '问职责、权限和目的看章程；问是否落实看纪要、活动、日志和结果。',
    ids: ['WQ-006', 'WQ-013', 'WQ-022', 'WQ-023', 'WQ-069', 'WQ-071'],
  },
  {
    title: '确认事实，再进入控制与建议',
    severity: '重点薄弱',
    count: 5,
    principle: '事实与范围 → 业务与资产 → 风险与分类 → 控制 → 测试或建议。',
    ids: ['WQ-014', 'WQ-016', 'WQ-017', 'WQ-020', 'WQ-054'],
  },
  {
    title: '综合风险判断与分类边界',
    severity: '重点薄弱',
    count: 5,
    principle: '单一因素只是输入；风险分析结果才决定保护等级和审计优先级。',
    ids: ['WQ-017', 'WQ-038', 'WQ-046', 'WQ-070', 'WQ-072'],
  },
  {
    title: '商业案例先回答业务价值',
    severity: '明确薄弱',
    count: 4,
    principle: '先看战略收益、可行性、成本和替代方案，不把安全控制当作完整决策依据。',
    ids: ['WQ-036', 'WQ-043', 'WQ-056', 'WQ-074'],
  },
  {
    title: '审计独立性、证据与发布隔离',
    severity: '重点薄弱',
    count: 8,
    principle: '审计师评价与报告，管理层实施；UAT 后冻结代码并撤销开发写权限。',
    ids: ['WQ-004', 'WQ-006', 'WQ-034', 'WQ-035', 'WQ-040', 'WQ-042', 'WQ-052', 'WQ-077'],
  },
  {
    title: '密码学与传输保护术语',
    severity: '明确薄弱',
    count: 4,
    principle: '认证回答“谁在登录”；加密信道回答“传输能否被窃听”；签名使用非对称密钥。',
    ids: ['WQ-053', 'WQ-057', 'WQ-065', 'WQ-068'],
  },
];

const storageKeys = {
  progress: 'cisa-review-progress-v1',
  session: 'cisa-review-session-v1',
};

function parseProgress(raw: string): ReviewProgress | null {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const parsed: ReviewProgress = {};
  for (const [id, entryValue] of Object.entries(value)) {
    if (!questionById.has(id) || typeof entryValue !== 'object' || entryValue === null || Array.isArray(entryValue)) continue;
    const entry = entryValue as Partial<ReviewEntry>;
    if (
      !Number.isInteger(entry.attempts) || Number(entry.attempts) < 0 ||
      !Number.isInteger(entry.correctStreak) || Number(entry.correctStreak) < 0 ||
      typeof entry.lastAnswer !== 'string' ||
      typeof entry.lastCorrect !== 'boolean' ||
      typeof entry.unsure !== 'boolean' ||
      typeof entry.lastReviewedAt !== 'string'
    ) continue;
    parsed[id] = entry as ReviewEntry;
  }
  return parsed;
}

function parseSession(raw: string): ReviewSession | null {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const candidate = value as Partial<ReviewSession>;
  if (!Array.isArray(candidate.queue) || !Array.isArray(candidate.results)) return null;
  const queue = [...new Set(candidate.queue.filter((id): id is string => typeof id === 'string' && questionById.has(id)))];
  if (!queue.length) return null;
  const index = Number.isInteger(candidate.index) ? Math.min(Math.max(Number(candidate.index), 0), queue.length - 1) : 0;
  const results = candidate.results.filter((result): result is SessionResult =>
    typeof result === 'object' && result !== null &&
    typeof result.questionId === 'string' && queue.includes(result.questionId) &&
    typeof result.selected === 'string' &&
    typeof result.correct === 'boolean' &&
    typeof result.unsure === 'boolean' &&
    typeof result.disputed === 'boolean',
  );
  return { queue, index, results };
}

function TextBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-2.5 text-sm leading-7 text-muted-foreground">
      {text.split('\n').filter(Boolean).map((line, index) =>
        line.startsWith('• ') ? (
          <div key={`${line}-${index}`} className="flex gap-2">
            <span aria-hidden="true" className="mt-[11px] size-1.5 shrink-0 rounded-full bg-primary/70" />
            <span>{line.slice(2)}</span>
          </div>
        ) : (
          <p key={`${line}-${index}`} className="whitespace-pre-wrap">{line}</p>
        ),
      )}
    </div>
  );
}

function StatusBadge({ progress }: { progress?: ReviewEntry }) {
  if (!progress) return <Badge variant="outline" className="text-muted-foreground">待重做</Badge>;
  if (progress.correctStreak >= 2) {
    return <Badge className="bg-[#e9f8f1] text-[#16734c] hover:bg-[#e9f8f1]">连续答对</Badge>;
  }
  if (progress.lastCorrect && progress.unsure) {
    return <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">答对但不确定</Badge>;
  }
  if (progress.lastCorrect) {
    return <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">已答对 1 次</Badge>;
  }
  return <Badge variant="destructive">本轮答错</Badge>;
}

export function ReviewApp() {
  const [activeView, setActiveView] = React.useState<View>('home');
  const [progress, setProgress] = React.useState<ReviewProgress>({});
  const [hydrated, setHydrated] = React.useState(false);
  const [session, setSession] = React.useState<ReviewSession | null>(null);
  const [quizOpen, setQuizOpen] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(false);
  const [selected, setSelected] = React.useState('');
  const [unsure, setUnsure] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showFullExplanation, setShowFullExplanation] = React.useState(false);
  const [detailQuestion, setDetailQuestion] = React.useState<Question | null>(null);
  const [search, setSearch] = React.useState('');
  const [questionDomain, setQuestionDomain] = React.useState('全部');
  const [questionStatus, setQuestionStatus] = React.useState('全部');
  const [mapDomain, setMapDomain] = React.useState('D1');
  const resultRef = React.useRef<HTMLHeadingElement>(null);
  const questionHeadingRef = React.useRef<HTMLLegendElement>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const savedProgress = localStorage.getItem(storageKeys.progress);
        const savedSession = localStorage.getItem(storageKeys.session);
        if (savedProgress) {
          const restoredProgress = parseProgress(savedProgress);
          if (restoredProgress) setProgress(restoredProgress);
          else localStorage.removeItem(storageKeys.progress);
        }
        if (savedSession) {
          const restored = parseSession(savedSession);
          if (restored) {
            const currentId = restored.queue[restored.index];
            const currentAlreadySubmitted = restored.results.some((result) => result.questionId === currentId);
            if (currentAlreadySubmitted && restored.index < restored.queue.length - 1) {
              restored.index += 1;
            } else if (currentAlreadySubmitted) {
              setShowSummary(true);
            }
            setSession(restored);
          } else {
            localStorage.removeItem(storageKeys.session);
          }
        }
      } catch {
        // A damaged local record should never block reviewing.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKeys.progress, JSON.stringify(progress));
    } catch {
      // Storage can be disabled; the review flow still works for this visit.
    }
  }, [hydrated, progress]);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      if (session) localStorage.setItem(storageKeys.session, JSON.stringify(session));
      else localStorage.removeItem(storageKeys.session);
    } catch {
      // Storage can be disabled; the review flow still works for this visit.
    }
  }, [hydrated, session]);

  const resetQuestionState = React.useCallback(() => {
    setSelected('');
    setUnsure(false);
    setSubmitted(false);
    setShowFullExplanation(false);
  }, []);

  const startSession = React.useCallback((ids: string[]) => {
    const queue = [...new Set(ids)].filter((id) => questionById.has(id));
    if (!queue.length) return false;
    setSession({ queue, index: 0, results: [] });
    setShowSummary(false);
    setQuizOpen(true);
    resetQuestionState();
    window.scrollTo({ top: 0 });
    return true;
  }, [resetQuestionState]);

  React.useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const tool: WebMcpTool = {
      name: 'start_weak_question_review',
      title: '开始薄弱题复习',
      description: '按可选的 CISA Domain 开始一组薄弱错题重做，并在页面中打开答题界面。',
      inputSchema: {
        type: 'object',
        properties: {
          domain: { type: 'string', enum: ['D1', 'D2', 'D3', 'D4', 'D5'] },
          count: { type: 'integer', minimum: 1, maximum: 20, default: 10 },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (typeof input !== 'object' || input === null || Array.isArray(input)) {
          throw new Error('输入必须是对象。');
        }
        const value = input as { domain?: string; count?: number };
        if (value.domain && !domains.some((domain) => domain.id === value.domain)) {
          throw new Error('domain 必须是 D1 至 D5。');
        }
        const count = value.count ?? 10;
        if (!Number.isInteger(count) || count < 1 || count > 20) {
          throw new Error('count 必须是 1 到 20 的整数。');
        }
        const pool = value.domain
          ? questions.filter((question) => question.domainId === value.domain)
          : priorityQueue.map((id) => questionById.get(id)).filter(Boolean) as Question[];
        const queue = pool.slice(0, count).map((question) => question.id);
        if (!startSession(queue)) throw new Error('没有可复习的题目。');
        return { status: 'started', domain: value.domain ?? 'priority', questionCount: queue.length };
      },
    };

    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);
    } catch {
      // WebMCP is progressive enhancement; the visible flow remains complete.
    }
    return () => lifecycle.abort();
  }, [startSession]);

  const reviewedCount = Object.keys(progress).length;
  const masteredCount = Object.values(progress).filter((entry) => entry.correctStreak >= 2).length;
  const currentQuestion = session ? questionById.get(session.queue[session.index]) ?? null : null;

  const knowledgeByDomain = React.useMemo(() => {
    const grouped: Record<string, { title: string; ids: string[] }[]> = {};
    for (const domain of domains) {
      const points = new Map<string, string[]>();
      questions.filter((question) => question.domainId === domain.id).forEach((question) => {
        const current = points.get(question.knowledgePoint) ?? [];
        current.push(question.id);
        points.set(question.knowledgePoint, current);
      });
      grouped[domain.id] = [...points.entries()].map(([title, ids]) => ({ title, ids }));
    }
    return grouped;
  }, []);

  const visibleQuestions = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return questions.filter((question) => {
      const entry = progress[question.id];
      const matchesDomain = questionDomain === '全部' || question.domainId === questionDomain;
      const matchesSearch = !query || [question.id, question.title, question.stem, question.knowledgePoint, ...question.tags]
        .join(' ').toLowerCase().includes(query);
      const matchesStatus = questionStatus === '全部'
        || (questionStatus === '待重做' && !entry)
        || (questionStatus === '答错' && entry && !entry.lastCorrect)
        || (questionStatus === '已巩固' && entry?.correctStreak >= 2);
      return matchesDomain && matchesSearch && matchesStatus;
    });
  }, [progress, questionDomain, questionStatus, search]);

  const navigate = (view: View) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitAnswer = (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    if (!currentQuestion || !selected || submitted || !session) return;
    const correct = selected === currentQuestion.correctAnswer;
    const result: SessionResult = {
      questionId: currentQuestion.id,
      selected,
      correct,
      unsure,
      disputed: currentQuestion.flags.disputedAnswer,
    };
    setSession((current) => current ? { ...current, results: [...current.results, result] } : current);
    setProgress((current) => {
      const previous = current[currentQuestion.id];
      return {
        ...current,
        [currentQuestion.id]: {
          attempts: (previous?.attempts ?? 0) + 1,
          correctStreak: correct && !unsure ? (previous?.correctStreak ?? 0) + 1 : 0,
          lastAnswer: selected,
          lastCorrect: correct,
          unsure,
          lastReviewedAt: new Date().toISOString(),
        },
      };
    });
    setSubmitted(true);
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const nextQuestion = () => {
    if (!session) return;
    if (session.index >= session.queue.length - 1) {
      setShowSummary(true);
      window.scrollTo({ top: 0 });
      return;
    }
    setSession({ ...session, index: session.index + 1 });
    resetQuestionState();
    window.scrollTo({ top: 0 });
    requestAnimationFrame(() => questionHeadingRef.current?.focus());
  };

  const finishSession = () => {
    setQuizOpen(false);
    setShowSummary(false);
    setSession(null);
    resetQuestionState();
    navigate('home');
  };

  const openQuestionList = (domainId?: string) => {
    setQuestionDomain(domainId ?? '全部');
    setQuestionStatus('全部');
    navigate('questions');
  };

  if (quizOpen && session) {
    if (showSummary) {
      const scored = session.results.filter((result) => !result.disputed);
      const correct = scored.filter((result) => result.correct).length;
      const unsureCount = session.results.filter((result) => result.unsure).length;
      const retryIds = session.results
        .filter((result) => !result.correct || result.unsure)
        .map((result) => result.questionId);
      return (
        <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-14">
          <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-5 shadow-[0_16px_50px_rgba(21,43,85,.09)] sm:p-8">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e9f8f1] text-[#16734c]">
              <Trophy className="size-8" aria-hidden="true" />
            </div>
            <div className="mt-5 text-center">
              <p className="text-sm font-semibold text-primary">本轮完成</p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">每次复盘，都在修正判断路径</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">连续两轮稳定答对后，题目才会标记为“已巩固”。</p>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-3 text-center"><strong className="block text-2xl">{correct}</strong><span className="text-xs text-muted-foreground">答对</span></div>
              <div className="rounded-xl bg-muted p-3 text-center"><strong className="block text-2xl">{Math.max(scored.length - correct, 0)}</strong><span className="text-xs text-muted-foreground">答错</span></div>
              <div className="rounded-xl bg-muted p-3 text-center"><strong className="block text-2xl">{unsureCount}</strong><span className="text-xs text-muted-foreground">不确定</span></div>
            </div>
            {session.results.some((result) => result.disputed) && (
              <p className="mt-3 rounded-xl bg-[#fff4e5] px-3 py-2 text-xs leading-5 text-[#8a4b00]">争议题按原则答案反馈，不计入本轮普通正确率。</p>
            )}
            <div className="mt-7 space-y-2">
              {session.results.map((result) => {
                const question = questionById.get(result.questionId)!;
                return (
                  <button key={result.questionId} type="button" onClick={() => setDetailQuestion(question)} className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-border px-3 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {result.correct && !result.unsure ? <CheckCircle2 className="size-5 shrink-0 text-[#16845b]" /> : <CircleAlert className="size-5 shrink-0 text-[#b15d00]" />}
                    <span className="min-w-0 flex-1"><span className="block text-xs text-muted-foreground">{question.id} · {question.domainId}</span><span className="block truncate text-sm font-medium">{question.title}</span></span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button className="h-11 flex-1 rounded-xl" onClick={() => retryIds.length ? startSession(retryIds) : startSession(priorityQueue)}>
                <RotateCcw data-icon="inline-start" />
                {retryIds.length ? `重做 ${retryIds.length} 道待巩固题` : '再练一组'}
              </Button>
              <Button variant="outline" className="h-11 flex-1 rounded-xl" onClick={finishSession}>返回首页</Button>
            </div>
          </section>
          <QuestionDialog question={detailQuestion} onOpenChange={(open) => !open && setDetailQuestion(null)} />
        </main>
      );
    }

    if (!currentQuestion) return null;
    const answerCorrect = selected === currentQuestion.correctAnswer;
    return (
      <main className="min-h-screen bg-background pb-32 text-foreground">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
            <Button variant="ghost" size="icon-lg" className="size-11" aria-label="退出答题" onClick={() => setQuizOpen(false)}>
              <ArrowLeft aria-hidden="true" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">重点重做</span>
                <span className="tabular-nums text-muted-foreground">{session.index + 1} / {session.queue.length}</span>
              </div>
              <Progress value={((session.index + (submitted ? 1 : 0)) / session.queue.length) * 100} className="[&_[data-slot=progress-track]]:h-1.5" aria-label={`答题进度 ${session.index + 1} / ${session.queue.length}`} />
            </div>
          </div>
        </header>

        <form id="quiz-form" onSubmit={submitAnswer} className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-9">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{currentQuestion.domainId} · {currentQuestion.domainName}</Badge>
            <Badge variant="outline">{currentQuestion.id}</Badge>
            {currentQuestion.flags.disputedAnswer && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">按原则复习</Badge>}
            {currentQuestion.flags.legacyContext && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">旧题语境</Badge>}
          </div>
          <p className="mb-2 text-sm font-medium text-primary">{currentQuestion.knowledgePoint}</p>
          <fieldset disabled={submitted}>
            <legend ref={questionHeadingRef} tabIndex={-1} className="text-lg font-bold leading-8 outline-none sm:text-xl sm:leading-9">{currentQuestion.stem}</legend>
            {currentQuestion.flags.malformedStem && <p className="mt-2 text-xs text-[#8a4b00]">题干按原文记录，可能存在缺字或断句。</p>}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selected === option.key;
                const isCorrectOption = submitted && option.key === currentQuestion.correctAnswer;
                const isWrongSelection = submitted && isSelected && !isCorrectOption;
                return (
                  <label key={option.key} className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm leading-6 transition-colors sm:p-4 ${isCorrectOption ? 'border-[#53a984] bg-[#edf9f3]' : isWrongSelection ? 'border-[#dc8078] bg-[#fff1ef]' : isSelected ? 'border-primary bg-secondary/70 ring-1 ring-primary/20' : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/30'} ${submitted ? 'cursor-default' : ''}`}>
                    <input type="radio" name="answer" value={option.key} checked={isSelected} onChange={(event) => setSelected(event.target.value)} className="mt-1 size-4 shrink-0 accent-[#2457d6]" />
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{option.key}</span>
                    <span className="flex-1">{option.text}</span>
                    {isCorrectOption && <Check className="mt-0.5 size-5 shrink-0 text-[#16845b]" aria-label="正确答案" />}
                    {isWrongSelection && <X className="mt-0.5 size-5 shrink-0 text-destructive" aria-label="你的错误选择" />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {!submitted && (
            <div className="mt-5 flex min-h-12 items-center gap-3 rounded-xl bg-muted px-4 text-sm">
              <Checkbox id="unsure-answer" checked={unsure} onCheckedChange={(checked) => setUnsure(checked === true)} aria-label="标记为不确定或蒙的" />
              <label htmlFor="unsure-answer" className="flex-1 cursor-pointer py-2"><strong className="font-semibold">我不确定 / 这题是蒙的</strong><span className="mt-0.5 block text-xs text-muted-foreground">即使答对，也会继续留在巩固队列</span></label>
            </div>
          )}

          {submitted && (
            <section aria-live="polite" className={`mt-7 rounded-2xl border p-4 sm:p-6 ${answerCorrect && !unsure ? 'border-[#b8e1cd] bg-[#f3fbf7]' : 'border-[#f0c38f] bg-[#fff9f0]'}`}>
              <div className="flex items-start gap-3">
                {answerCorrect && !unsure ? <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[#16845b]" /> : <CircleAlert className="mt-0.5 size-6 shrink-0 text-[#b15d00]" />}
                <div>
                  <h2 ref={resultRef} tabIndex={-1} className="text-lg font-bold outline-none">
                    {answerCorrect ? (unsure ? '答对，但仍需巩固' : '答对了') : `答错了｜你选 ${selected}，正确答案 ${currentQuestion.correctAnswer}`}
                  </h2>
                  {currentQuestion.flags.disputedAnswer && (
                    <p className="mt-1 text-xs leading-5 text-[#8a4b00]">题库答案为 {currentQuestion.bankAnswer}；本页依据标准原则采用 {currentQuestion.principleAnswer}，不计入普通正确率。</p>
                  )}
                </div>
              </div>
              <div className="mt-5 border-t border-current/10 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-foreground/55">核心解析</p>
                <TextBlock text={currentQuestion.explanation.split('\n').slice(0, 1).join('\n')} />
              </div>
              <Button type="button" variant="outline" className="mt-5 h-10 w-full rounded-xl bg-card sm:w-auto" aria-expanded={showFullExplanation} aria-controls="full-explanation" onClick={() => setShowFullExplanation((value) => !value)}>
                <Eye data-icon="inline-start" />
                {showFullExplanation ? '收起详细解析' : '查看详细解析'}
              </Button>
              {showFullExplanation && (
                <div id="full-explanation" className="mt-5 space-y-5 border-t border-current/10 pt-5">
                  <div><h3 className="mb-2 font-bold">选项与原则</h3><TextBlock text={currentQuestion.explanation} /></div>
                  {currentQuestion.wrongCause && <div><h3 className="mb-2 font-bold">错因判断</h3><TextBlock text={currentQuestion.wrongCause} /></div>}
                  <div className="rounded-xl bg-card/80 p-4"><h3 className="mb-2 flex items-center gap-2 font-bold"><Target className="size-4 text-primary" />纠偏动作</h3><TextBlock text={currentQuestion.correction} /></div>
                </div>
              )}
            </section>
          )}
        </form>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto max-w-3xl">
            {!submitted ? (
              <Button className="h-12 w-full rounded-xl text-base" type="submit" form="quiz-form" disabled={!selected}>
                提交答案
              </Button>
            ) : (
              <Button className="h-12 w-full rounded-xl text-base" type="button" onClick={nextQuestion}>
                {session.index === session.queue.length - 1 ? '查看本轮总结' : '下一题'}
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-28 text-foreground sm:pb-10">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-5 px-4 sm:px-6">
          <button type="button" onClick={() => navigate('home')} className="flex min-h-11 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><ShieldCheck className="size-5" aria-hidden="true" /></span>
            <span><span className="block text-sm font-bold tracking-tight">CISA 弱点回顾</span><span className="block text-xs text-muted-foreground">把错题变成判断力</span></span>
          </button>
          <nav aria-label="主导航" className="hidden items-center rounded-xl bg-muted p-1 sm:flex">
            {[
              ['home', '今日回顾'],
              ['map', '知识地图'],
              ['questions', '错题本'],
            ].map(([view, label]) => (
              <button key={view} type="button" aria-current={activeView === view ? 'page' : undefined} onClick={() => navigate(view as View)} className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeView === view ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{label}</button>
            ))}
          </nav>
          <Badge variant="outline" className="hidden h-7 bg-background px-2.5 text-muted-foreground lg:inline-flex">更新于 2026.09.08</Badge>
        </div>
      </header>

      {activeView === 'home' && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <section aria-labelledby="today-title" className="grid gap-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]">
            <div className="min-w-0">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div><p className="mb-1 text-sm font-medium text-primary">今天，从最容易混淆的地方开始</p><h1 id="today-title" className="text-2xl font-extrabold tracking-tight sm:text-3xl">把错题变成判断力</h1></div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><BookOpenCheck className="size-4" />79 道薄弱题</div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_10px_35px_rgba(22,48,93,.08)]">
                <div className="border-b border-border bg-[linear-gradient(135deg,rgba(36,87,214,.09),rgba(31,151,131,.06))] p-5 sm:p-7">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-xl"><Badge className="mb-3 bg-danger-soft text-destructive hover:bg-danger-soft"><CircleAlert data-icon="inline-start" />重点薄弱 · 优先 1</Badge><h2 className="text-xl font-bold leading-snug sm:text-2xl">控制目标、风险发生点与控制边界</h2><p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">先定位“风险事件—对象层级—直接影响—控制目标”，再评价选项，避免被显眼的技术描述带偏。</p></div>
                    <span className="rounded-xl border border-border bg-card px-3 py-2 text-center"><strong className="block text-lg tabular-nums">23</strong><span className="text-xs text-muted-foreground">道相关题</span></span>
                  </div>
                  <Progress value={reviewedCount / questions.length * 100} aria-label={`已重做 ${reviewedCount} 道题`} className="[&_[data-slot=progress-indicator]]:bg-primary [&_[data-slot=progress-track]]:h-2"><span className="text-xs font-medium">总复习进度</span><span className="ml-auto text-xs tabular-nums text-muted-foreground">{reviewedCount} / 79</span></Progress>
                </div>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground"><RotateCcw className="size-4" /></span><span>{session ? `上次做到第 ${session.index + 1} / ${session.queue.length} 题` : '原题作答后，再展开完整解析'}</span></div>
                  <Button size="lg" className="h-11 w-full rounded-xl px-5 shadow-sm sm:w-auto" onClick={() => session ? setQuizOpen(true) : startSession(priorityQueue)}>{session ? '继续上次' : '开始重点重做'}<ArrowRight data-icon="inline-end" /></Button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3" aria-label="题目统计">
                {[[String(questions.length), '薄弱题'], [String(reviewedCount), '已重做'], [String(masteredCount), '已巩固']].map(([value, label]) => <div key={label} className="rounded-xl border border-border bg-card p-3 sm:p-4"><strong className="block text-xl font-extrabold tabular-nums sm:text-2xl">{value}</strong><span className="text-xs text-muted-foreground sm:text-sm">{label}</span></div>)}
              </div>
            </div>

            <aside aria-labelledby="domains-title" className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Layers3 className="size-5 text-primary" /><h2 id="domains-title" className="font-bold">按 Domain 浏览</h2></div><Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('map')}>全部<ChevronRight data-icon="inline-end" /></Button></div>
              <div className="divide-y divide-border">{domains.map((domain) => <button key={domain.id} type="button" onClick={() => openQuestionList(domain.id)} className="group flex min-h-16 w-full items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">{domain.id}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{domain.name}</span><span className="text-xs text-muted-foreground">官方权重 {domain.weight}</span></span><span className="text-right"><strong className="block text-sm tabular-nums">{domain.count}</strong><span className="text-[11px] text-muted-foreground">薄弱题</span></span><ChevronRight className="size-4 text-muted-foreground" /></button>)}</div>
              <p className="mt-4 rounded-xl bg-muted px-3 py-2.5 text-xs leading-5 text-muted-foreground">薄弱题数量受当前做题分布影响，不等同于各 Domain 的真实掌握率。</p>
            </aside>
          </section>

          <section aria-labelledby="next-priority" className="mt-9">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-primary">Review path</p><h2 id="next-priority" className="mt-1 text-xl font-extrabold">接下来复习什么</h2></div><Button variant="ghost" onClick={() => navigate('map')}>完整地图<ArrowRight data-icon="inline-end" /></Button></div>
            <div className="grid gap-3 md:grid-cols-3">{patterns.slice(1, 4).map((pattern, index) => <article key={pattern.title} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><span className="grid size-8 place-items-center rounded-lg bg-muted text-xs font-extrabold">0{index + 2}</span><Badge variant={pattern.severity === '重点薄弱' ? 'destructive' : 'secondary'}>{pattern.severity}</Badge></div><h3 className="font-bold leading-6">{pattern.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{pattern.principle}</p><Button variant="link" className="mt-3 min-h-11 px-0" onClick={() => startSession(pattern.ids)}>重做相关题<ArrowRight data-icon="inline-end" /></Button></article>)}</div>
          </section>
        </div>
      )}

      {activeView === 'map' && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <section><p className="text-sm font-semibold text-primary">个人知识地图</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">优先修正重复出现的判断偏差</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">先按跨题型模式复习，再回到五个 Domain 定位具体知识点。重点程度来自错题重复证据，不是考试掌握率。</p></section>
          <section aria-labelledby="patterns-title" className="mt-7"><div className="mb-4 flex items-center gap-2"><Sparkles className="size-5 text-primary" /><h2 id="patterns-title" className="text-lg font-bold">当前优先顺序</h2></div><div className="grid gap-3 md:grid-cols-2">{patterns.map((pattern, index) => <article key={pattern.title} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{pattern.title}</h3><Badge variant={pattern.severity === '重点薄弱' ? 'destructive' : 'secondary'}>{pattern.severity}</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{pattern.principle}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{pattern.count} 道相关证据题</span><Button variant="outline" size="sm" className="h-11" onClick={() => startSession(pattern.ids)}>专项重做<ArrowRight data-icon="inline-end" /></Button></div></div></div></article>)}</div></section>
          <section aria-labelledby="domain-map-title" className="mt-10"><div className="mb-4"><h2 id="domain-map-title" className="text-lg font-bold">按 Domain 查看知识点</h2><p className="mt-1 text-sm text-muted-foreground">选择一个 Domain，查看知识点与关联错题。</p></div><div className="flex flex-wrap gap-2">{domains.map((domain) => <button key={domain.id} type="button" onClick={() => setMapDomain(domain.id)} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mapDomain === domain.id ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border bg-card text-muted-foreground'}`}>{domain.id} · {domain.count} 题</button>)}</div><div className="mt-4 rounded-2xl border border-border bg-card p-4 sm:p-6"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-bold text-primary">{mapDomain}</p><h3 className="text-xl font-extrabold">{domains.find((domain) => domain.id === mapDomain)?.name}</h3></div><Button variant="outline" onClick={() => openQuestionList(mapDomain)}>查看全部错题<ArrowRight data-icon="inline-end" /></Button></div><Accordion>{knowledgeByDomain[mapDomain].map((point, index) => <AccordionItem key={point.title} value={`${mapDomain}-${index}`}><AccordionTrigger className="min-h-14 no-underline hover:no-underline"><span className="pr-4"><span className="block font-semibold">{point.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">关联 {point.ids.length} 道错题</span></span></AccordionTrigger><AccordionContent className="pb-4"><div className="flex flex-wrap gap-2 pt-1">{point.ids.map((id) => <Button key={id} variant="outline" size="sm" onClick={() => setDetailQuestion(questionById.get(id)!)}><Eye data-icon="inline-start" />{id}</Button>)}<Button size="sm" onClick={() => startSession(point.ids)}><RotateCcw data-icon="inline-start" />重做这组</Button></div></AccordionContent></AccordionItem>)}</Accordion></div></section>
        </div>
      )}

      {activeView === 'questions' && (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
          <section><p className="text-sm font-semibold text-primary">79 道薄弱题</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">错题本</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">“查看解析”不会改变复习状态；只有提交答案才记录一次重做。</p></section>
          <section aria-label="筛选错题" className="mt-6 rounded-2xl border border-border bg-card p-3 sm:p-4"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索编号、题目、知识点或标签" className="h-11 pl-10" aria-label="搜索错题" /></div><div className="mt-3 flex flex-wrap gap-2">{['全部', 'D1', 'D2', 'D3', 'D4', 'D5'].map((domain) => <button key={domain} type="button" onClick={() => setQuestionDomain(domain)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${questionDomain === domain ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border bg-background text-muted-foreground'}`}>{domain}</button>)}</div><div className="mt-2 flex flex-wrap gap-2">{['全部', '待重做', '答错', '已巩固'].map((status) => <button key={status} type="button" onClick={() => setQuestionStatus(status)} className={`min-h-11 rounded-lg border px-3 text-sm font-medium ${questionStatus === status ? 'border-foreground/30 bg-muted text-foreground' : 'border-border bg-background text-muted-foreground'}`}>{status}</button>)}</div></section>
          <div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">找到 <strong className="text-foreground">{visibleQuestions.length}</strong> 道题</p>{visibleQuestions.length > 1 && <Button size="sm" className="h-11" onClick={() => startSession(visibleQuestions.map((question) => question.id))}><RotateCcw data-icon="inline-start" />重做当前筛选</Button>}</div>
          <section aria-label="错题列表" className="mt-3 space-y-3">{visibleQuestions.map((question) => <article key={question.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="secondary">{question.domainId}</Badge><span className="text-xs font-semibold text-muted-foreground">{question.id}</span><StatusBadge progress={progress[question.id]} />{question.flags.guessedCorrect && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">原为蒙对题</Badge>}{question.flags.disputedAnswer && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">争议题</Badge>}{question.flags.legacyContext && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">旧题语境</Badge>}</div><h2 className="font-bold leading-6">{question.title}</h2><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{question.stem}</p></div><div className="flex w-full gap-2 sm:w-auto"><Button variant="outline" className="h-11 flex-1 sm:flex-none" onClick={() => setDetailQuestion(question)}><Eye data-icon="inline-start" />查看解析</Button><Button className="h-11 flex-1 sm:flex-none" onClick={() => startSession([question.id])}><RotateCcw data-icon="inline-start" />重做</Button></div></div><div className="mt-3 flex flex-wrap gap-1.5">{question.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">{tag}</span>)}</div></article>)}</section>
          {!visibleQuestions.length && <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-8 text-center"><CircleHelp className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-bold">没有符合条件的题目</h2><p className="mt-1 text-sm text-muted-foreground">试试清空搜索或切换筛选条件。</p></div>}
        </div>
      )}

      <nav aria-label="移动端主导航" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/96 px-2 pt-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="grid grid-cols-3">{[
          ['home', '首页', Home],
          ['map', '知识地图', Layers3],
          ['questions', '错题', ListChecks],
        ].map(([view, label, Icon]) => <button key={String(view)} type="button" aria-current={activeView === view ? 'page' : undefined} onClick={() => navigate(view as View)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium ${activeView === view ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'}`}><Icon className="size-5" />{String(label)}</button>)}</div>
      </nav>

      <QuestionDialog question={detailQuestion} onOpenChange={(open) => !open && setDetailQuestion(null)} />
    </main>
  );
}

function QuestionDialog({ question, onOpenChange }: { question: Question | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={Boolean(question)} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[92dvh] w-[calc(100%-1rem)] max-w-3xl gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-3xl">
        {question && (
          <>
            <DialogHeader className="sticky top-0 z-10 border-b border-border bg-card/96 p-4 pr-14 backdrop-blur sm:p-6 sm:pr-16">
              <div className="mb-1 flex flex-wrap gap-2"><Badge variant="secondary">{question.domainId}</Badge><Badge variant="outline">{question.id}</Badge>{question.flags.disputedAnswer && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">争议题</Badge>}{question.flags.legacyContext && <Badge className="bg-[#fff4e5] text-[#9a5300] hover:bg-[#fff4e5]">旧题语境</Badge>}</div>
              <DialogTitle className="text-lg font-bold leading-7 sm:text-xl">{question.title}</DialogTitle>
              <DialogDescription className="sr-only">查看题目、正确答案和完整解析</DialogDescription>
              <DialogClose render={<Button variant="ghost" size="icon-lg" className="absolute right-3 top-3 size-11" />}><X /><span className="sr-only">关闭解析</span></DialogClose>
            </DialogHeader>
            <div className="space-y-6 p-4 sm:p-6">
              <section><p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-primary">原题</p><h3 className="text-base font-semibold leading-7">{question.stem}</h3><div className="mt-4 space-y-2">{question.options.map((option) => <div key={option.key} className={`flex gap-3 rounded-xl border p-3 text-sm leading-6 ${option.key === question.correctAnswer ? 'border-[#9bcfb6] bg-[#edf9f3]' : 'border-border'}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{option.key}</span><span className="flex-1">{option.text}</span>{option.key === question.correctAnswer && <Check className="size-5 shrink-0 text-[#16845b]" aria-label="正确答案" />}</div>)}</div></section>
              <section className="rounded-xl bg-secondary/60 p-4"><p className="text-xs font-bold text-secondary-foreground">答案</p><p className="mt-1 font-bold">正确答案：{question.correctAnswer}{question.originalAnswer && <span className="ml-3 font-normal text-muted-foreground">原选择：{question.originalAnswer}</span>}</p>{question.flags.disputedAnswer && <p className="mt-2 text-xs leading-5 text-[#8a4b00]">题库答案 {question.bankAnswer}，按标准原则应选 {question.principleAnswer}。本题请按原则理解，不机械背题库。</p>}</section>
              <section><h3 className="mb-2 flex items-center gap-2 font-bold"><BookOpenCheck className="size-4 text-primary" />完整解析</h3><TextBlock text={question.explanation} /></section>
              {question.wrongCause && <section><h3 className="mb-2 flex items-center gap-2 font-bold"><Flag className="size-4 text-[#b15d00]" />错因判断</h3><TextBlock text={question.wrongCause} /></section>}
              <section className="rounded-xl bg-muted p-4"><h3 className="mb-2 flex items-center gap-2 font-bold"><Target className="size-4 text-primary" />纠偏动作</h3><TextBlock text={question.correction} /></section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
