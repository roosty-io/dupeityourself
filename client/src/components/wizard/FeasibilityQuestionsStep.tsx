import { useMemo, useState } from "react";
import type { FeasibilityQuestion } from "@shared/types";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: FeasibilityQuestion;
  value: string;
  onChange: (answer: string) => void;
}) {
  const inputId = `fq-${question.id}`;
  switch (question.answerType) {
    case "number":
      return (
        <input
          id={inputId}
          type="number"
          className="input max-w-48"
          placeholder="Enter a number…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "boolean":
      return (
        <div className="flex gap-2" role="radiogroup" aria-label={question.question}>
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={value === opt}
              onClick={() => onChange(opt)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                value === opt
                  ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                  : "border-bdr bg-surface text-soot hover:bg-sand"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case "single_choice":
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={question.question}>
          {(question.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={value === opt}
              onClick={() => onChange(opt)}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                value === opt
                  ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                  : "border-bdr bg-surface text-soot hover:bg-sand"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    case "multi_choice": {
      const selected = value ? value.split(", ").filter(Boolean) : [];
      const toggle = (opt: string) => {
        const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
        onChange(next.join(", "));
      };
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((opt) => {
            const isOn = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(opt)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isOn
                    ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                    : "border-bdr bg-surface text-soot hover:bg-sand"
                }`}
              >
                {isOn ? "✅ " : ""}
                {opt}
              </button>
            );
          })}
        </div>
      );
    }
    default:
      return (
        <input
          id={inputId}
          className="input"
          placeholder="Type your answer…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export function FeasibilityQuestionsStep({
  projectId,
  questions,
  onGenerate,
  onBack,
}: {
  projectId: string;
  questions: FeasibilityQuestion[];
  /** Called after answers are saved (or skipped) — the parent kicks off generation. */
  onGenerate: () => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const q of questions) {
      if (q.answer) initial[q.id] = q.answer;
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAnswer = (id: string, answer: string) =>
    setAnswers((prev) => ({ ...prev, [id]: answer }));

  const unansweredSafety = useMemo(
    () => questions.filter((q) => q.requiredForSafety && !(answers[q.id] ?? "").trim()),
    [questions, answers]
  );
  const safetyBlocked = unansweredSafety.length > 0;

  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim()).length;

  const submitAnswers = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const feasibilityAnswers = questions
        .filter((q) => (answers[q.id] ?? "").trim())
        .map((q) => ({ id: q.id, answer: (answers[q.id] ?? "").trim() }));
      if (feasibilityAnswers.length > 0) {
        await api.updateProject(projectId, { feasibilityAnswers });
      }
      onGenerate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your answers.");
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">✅ No extra questions needed</h2>
          <p className="text-sm text-muted mt-1">
            Your reference and constraints gave us everything we need. Ready when you are.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-bdr">
          <button type="button" className="btn-ghost btn-md" onClick={onBack} disabled={submitting}>
            ← Back
          </button>
          <button type="button" className="btn-primary btn-lg" onClick={onGenerate}>
            Generate My Build Plan →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">💬 A few smart questions</h2>
        <p className="text-sm text-muted mt-1">
          I can generate this now, but answering these will make the plan much better. Skip any
          question and we'll use the stated assumption instead.
        </p>
      </div>

      <ol className="space-y-4">
        {questions.map((q, i) => {
          const answered = (answers[q.id] ?? "").trim().length > 0;
          return (
            <li key={q.id} className="card p-4 sm:p-5">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold text-faint mt-1 shrink-0">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{q.question}</p>
                    {q.requiredForSafety && (
                      <span className="chip bg-ember-100 text-ember-800">⚠️ Required for safety</span>
                    )}
                    {answered && !q.requiredForSafety && (
                      <span className="chip bg-pine-100 text-pine-800">✅ Answered</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">{q.whyItMatters}</p>
                  <div className="mt-3">
                    <QuestionInput
                      question={q}
                      value={answers[q.id] ?? ""}
                      onChange={(a) => setAnswer(q.id, a)}
                    />
                  </div>
                  {!q.requiredForSafety && (
                    <p className="text-[11px] text-faint mt-2">
                      If skipped, we'll assume: {q.assumptionIfSkipped}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {error && (
        <p className="text-sm text-danger flex items-center gap-1.5">
          <span aria-hidden>⚠️</span> {error}
        </p>
      )}

      {safetyBlocked && (
        <p className="text-xs text-ember-800 bg-ember-50 border border-ember-200 rounded-lg px-3 py-2.5">
          ⚠️ {unansweredSafety.length === 1 ? "1 safety question needs" : `${unansweredSafety.length} safety questions need`}{" "}
          an answer before we can generate. We won't guess on anything that affects structural
          safety or load-bearing use.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-bdr">
        <button type="button" className="btn-ghost btn-md" onClick={onBack} disabled={submitting}>
          ← Back
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary btn-lg"
            onClick={onGenerate}
            disabled={submitting || safetyBlocked}
            title={safetyBlocked ? "Answer the safety-flagged questions first" : undefined}
          >
            Generate With Assumptions
          </button>
          <button
            type="button"
            className="btn-primary btn-lg"
            onClick={submitAnswers}
            disabled={submitting || safetyBlocked || answeredCount === 0}
            title={
              safetyBlocked
                ? "Answer the safety-flagged questions first"
                : answeredCount === 0
                  ? "Answer at least one question, or generate with assumptions"
                  : undefined
            }
          >
            {submitting && <Spinner className="w-4 h-4 text-white" />}
            Answer Questions & Generate →
          </button>
        </div>
      </div>
    </div>
  );
}
