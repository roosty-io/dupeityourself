import { ReactNode } from "react";

export type BadgeTone = "green" | "orange" | "oak" | "gray" | "red" | "yellow";

const tones: Record<BadgeTone, string> = {
  green: "bg-pine-100 text-pine-800",
  orange: "bg-ember-100 text-ember-800",
  oak: "bg-oak-100 text-oak-800",
  gray: "bg-sand text-soot",
  red: "bg-red-100 text-red-800",
  yellow: "bg-amber-100 text-amber-800",
};

export function Badge({ tone = "gray", children, className = "" }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
}

export function riskTone(level: string): BadgeTone {
  if (level === "low") return "green";
  if (level === "medium") return "yellow";
  if (level === "high" || level === "professional_review_recommended") return "orange";
  if (level === "unsupported") return "red";
  return "gray";
}
