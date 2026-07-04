import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@shared/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

const SUGGESTED_QUESTIONS = [
  "Can I use pine instead?",
  "Do I really need a pocket hole jig?",
  "What screw length here?",
  "Can this support daily family use?",
  "Which step goes wrong most?",
];

export function ProjectAdvisorChat({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const history = messages;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const res = await api.advisorChat(projectId, { message: trimmed, history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, createdAt: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The advisor is unavailable right now.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card title="💬 Project advisor" subtitle="Ask the store advisor anything about this specific build.">
      <div
        ref={scrollRef}
        className="h-72 overflow-y-auto rounded-xl border border-bdr bg-cream/60 p-3 sm:p-4 space-y-3"
        aria-live="polite"
      >
        {messages.length === 0 && !pending && (
          <p className="text-sm text-muted text-center py-10">
            👋 Ask a question about materials, tools, or steps — answers use your project's plan and constraints.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-pine-600 text-white rounded-br-md"
                  : "bg-sand text-ink rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start">
            <div className="bg-sand text-soot rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm" aria-label="Advisor is typing">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">·</span>
                <span className="animate-bounce [animation-delay:120ms]">·</span>
                <span className="animate-bounce [animation-delay:240ms]">·</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={pending}
              className="chip bg-sand text-soot hover:bg-linen transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2 mt-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          className="input"
          placeholder="Ask the store advisor…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Ask the store advisor"
        />
        <button type="submit" className="btn-primary btn-md shrink-0" disabled={pending || input.trim() === ""}>
          Send
        </button>
      </form>

      {error && (
        <p className="text-sm text-danger mt-2 flex items-center gap-1.5">
          <span aria-hidden>⚠️</span> {error}
        </p>
      )}

      <p className="text-xs text-faint mt-3">
        Advice is project-specific guidance, not a professional engineering review.
      </p>
    </Card>
  );
}
