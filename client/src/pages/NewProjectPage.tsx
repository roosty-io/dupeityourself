import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FeasibilityQuestion, ProjectConstraints, SourceType } from "@shared/types";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { WizardSteps } from "@/components/wizard/WizardSteps";
import { SourceInputStep } from "@/components/wizard/SourceInputStep";
import type { SourceInputValue } from "@/components/wizard/SourceInputStep";
import { ProjectTypeSelector, guessProjectType } from "@/components/wizard/ProjectTypeSelector";
import { ConstraintsForm } from "@/components/wizard/ConstraintsForm";
import { FeasibilityQuestionsStep } from "@/components/wizard/FeasibilityQuestionsStep";
import { ProcessingPipeline } from "@/components/wizard/ProcessingPipeline";

const DEFAULT_CONSTRAINTS: ProjectConstraints = {
  skillLevel: "beginner",
  ownedTools: [],
  preferredStores: [],
  desiredFidelity: "close_visual_match",
  durability: "everyday_use",
  optimizeFor: "balanced",
};

const EMPTY_SOURCE: SourceInputValue = {
  sourceUrl: "",
  images: [],
  description: "",
  pastedText: "",
};

function InlineLoading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
      <Spinner className="w-8 h-8" />
      <p className="text-sm font-medium text-ink">{title}</p>
      {sub && <p className="text-xs text-muted max-w-sm">{sub}</p>}
    </div>
  );
}

export default function NewProjectPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [source, setSource] = useState<SourceInputValue>(EMPTY_SOURCE);
  const [projectType, setProjectType] = useState("");
  const [guessed, setGuessed] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<ProjectConstraints>(DEFAULT_CONSTRAINTS);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FeasibilityQuestion[]>([]);
  const [phase, setPhase] = useState<"idle" | "analyzing" | "starting">("idle");
  const [phaseError, setPhaseError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"analyze" | "start" | null>(null);

  // Prefill skill/stores/workspace/tools from saved preferences; ignore errors.
  useEffect(() => {
    let cancelled = false;
    api
      .getPreferences()
      .then((prefs) => {
        if (cancelled) return;
        setConstraints((prev) => ({
          ...prev,
          skillLevel: prefs.skillLevel,
          preferredStores: prefs.preferredStores,
          workspaceType: prefs.workspaceType,
          ownedTools: prefs.ownedTools,
          budgetMin: prefs.defaultBudgetMin,
          budgetMax: prefs.defaultBudgetMax,
          dimensions: { ...(prev.dimensions ?? {}), unit: prefs.units },
        }));
      })
      .catch(() => {
        /* preferences are optional — keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const computeSourceType = (): SourceType => {
    const hasUrl = source.sourceUrl.trim().length > 0;
    const hasImages = source.images.length > 0;
    const hasText = source.description.trim().length > 0 || source.pastedText.trim().length > 0;
    const count = [hasUrl, hasImages, hasText].filter(Boolean).length;
    if (count > 1) return "mixed";
    if (hasUrl) return "url";
    if (hasImages) return "images";
    return "description";
  };

  const handleSourceNext = () => {
    const guess = guessProjectType(
      [source.sourceUrl, source.description, source.pastedText].join(" ")
    );
    setGuessed(guess);
    if (!projectType && guess) setProjectType(guess);
    setStep(2);
  };

  const analyzeAndContinue = async () => {
    setPhase("analyzing");
    setPhaseError(null);
    setLastAction("analyze");
    try {
      let id = projectId;
      if (!id) {
        const created = await api.createProject({
          sourceType: computeSourceType(),
          sourceUrl: source.sourceUrl.trim() || undefined,
          sourceImages: source.images.length > 0 ? source.images : undefined,
          userDescription: source.description.trim() || undefined,
          pastedProductText: source.pastedText.trim() || undefined,
          projectType,
          constraints,
        });
        id = created.id;
        setProjectId(id);
      } else {
        // Returning from a later step — sync the latest edits before re-analyzing.
        await api.updateProject(id, {
          projectType,
          sourceUrl: source.sourceUrl.trim() || undefined,
          userDescription: source.description.trim() || undefined,
          pastedProductText: source.pastedText.trim() || undefined,
          constraints,
        });
      }
      await api.analyzeProject(id);
      const nextQuestions = await api.getFeasibilityQuestions(id);
      setQuestions(nextQuestions);
      setStep(4);
    } catch (err) {
      setPhaseError(err instanceof Error ? err.message : "Analysis failed — please try again.");
    } finally {
      setPhase("idle");
    }
  };

  const startGeneration = async () => {
    if (!projectId) return;
    setPhase("starting");
    setPhaseError(null);
    setLastAction("start");
    try {
      await api.generatePlan(projectId);
      setStep(5);
    } catch (err) {
      setPhaseError(err instanceof Error ? err.message : "Could not start plan generation.");
    } finally {
      setPhase("idle");
    }
  };

  const retryLastAction = () => {
    if (lastAction === "start") {
      startGeneration();
    } else {
      analyzeAndContinue();
    }
  };

  const busy = phase !== "idle";

  const renderStepContent = () => {
    if (phase === "analyzing") {
      return (
        <InlineLoading
          title="Analyzing your reference…"
          sub="Extracting product details, identifying materials and construction, and preparing a few smart questions."
        />
      );
    }
    if (phase === "starting") {
      return (
        <InlineLoading
          title="Starting the build pipeline…"
          sub="Kicking off the multi-agent generation run."
        />
      );
    }
    if (phaseError) {
      return <ErrorState message={phaseError} onRetry={retryLastAction} />;
    }
    if (step === 1) {
      return <SourceInputStep value={source} onChange={setSource} onNext={handleSourceNext} />;
    }
    if (step === 2) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-ink">What kind of project is this?</h2>
            <p className="text-sm text-muted mt-1">
              This helps route your reference to the right specialists — woodworking, upholstery,
              fiber crafts, and so on.
            </p>
          </div>
          <ProjectTypeSelector value={projectType} onChange={setProjectType} guessed={guessed} />
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-bdr">
            <button type="button" className="btn-ghost btn-md" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={() => setStep(3)}
              disabled={!projectType}
            >
              Continue →
            </button>
          </div>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-ink">Your budget, tools, and constraints</h2>
            <p className="text-sm text-muted mt-1">
              The plan is built around what you actually own and where you actually work — no
              wishful thinking.
            </p>
          </div>
          <ConstraintsForm value={constraints} onChange={setConstraints} />
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-bdr">
            <button type="button" className="btn-ghost btn-md" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button type="button" className="btn-primary btn-lg" onClick={analyzeAndContinue}>
              Analyze My Reference →
            </button>
          </div>
        </div>
      );
    }
    if (step === 4 && projectId) {
      return (
        <FeasibilityQuestionsStep
          projectId={projectId}
          questions={questions}
          onGenerate={startGeneration}
          onBack={() => setStep(3)}
        />
      );
    }
    if (step === 5 && projectId) {
      return (
        <ProcessingPipeline
          projectId={projectId}
          onComplete={() => navigate(`/projects/${projectId}`)}
        />
      );
    }
    return null;
  };

  // Steps 1-3 sit inside a single card; steps 4-5 render their own cards.
  const wrapInCard = step <= 3 || busy || phaseError !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">New Build Plan</h1>
        <p className="text-sm text-muted mt-1">
          From expensive inspiration to a practical, inspired-by build plan in five steps.
        </p>
      </div>

      <WizardSteps current={step} />

      {wrapInCard ? <div className="card p-5 sm:p-8">{renderStepContent()}</div> : renderStepContent()}
    </div>
  );
}
