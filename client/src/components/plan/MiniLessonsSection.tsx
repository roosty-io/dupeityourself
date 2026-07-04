import type { MiniLesson } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

function difficultyTone(difficulty: MiniLesson["difficulty"]): BadgeTone {
  switch (difficulty) {
    case "beginner":
      return "green";
    case "intermediate":
      return "yellow";
    case "advanced":
      return "orange";
  }
}

export function MiniLessonCard({ lesson }: { lesson: MiniLesson }) {
  return (
    // the id lets build steps deep-link ("jump to lesson") via scrollIntoView
    <div id={lesson.id} className="scroll-mt-24">
      <Accordion
        title={<span>📚 {lesson.title}</span>}
        badge={
          <span className="flex items-center gap-1.5">
            <Badge tone={difficultyTone(lesson.difficulty)}>{lesson.difficulty}</Badge>
            <span className="chip bg-sand text-soot">{lesson.skillCategory}</span>
          </span>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-soot leading-relaxed">{lesson.explanation}</p>

          {lesson.steps && lesson.steps.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-ink mb-1.5">How to do it</h5>
              <ol className="list-decimal pl-5 space-y-1.5 text-sm text-soot marker:font-semibold marker:text-pine-700">
                {lesson.steps.map((s, i) => (
                  <li key={i} className="leading-relaxed">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
              <p className="text-xs font-semibold text-red-800 mb-1">🚫 Common mistakes</p>
              <ul className="list-disc pl-4 space-y-1 text-sm text-red-900">
                {lesson.commonMistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {lesson.safetyNotes && lesson.safetyNotes.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
              <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Safety</p>
              <ul className="list-disc pl-4 space-y-1 text-sm text-amber-900">
                {lesson.safetyNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Accordion>
    </div>
  );
}

export function MiniLessonsSection({ lessons }: { lessons: MiniLesson[] }) {
  return (
    <Card
      title="📚 Skill mini lessons"
      subtitle="Short technique primers for the skills this build leans on — read them before the step that needs them."
    >
      {lessons.length === 0 ? (
        <p className="text-sm text-muted">No mini lessons for this plan — the techniques used are all covered in the steps.</p>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <MiniLessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </Card>
  );
}
