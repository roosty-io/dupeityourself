export function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function moneyRange(low: number, high: number): string {
  return `${money(low)}–${money(high)}`;
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function titleCase(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function scoreBandLabel(score: number): string {
  if (score >= 85) return "Excellent DIY candidate";
  if (score >= 70) return "Good DIY candidate";
  if (score >= 50) return "Possible, with tradeoffs";
  if (score >= 30) return "Probably not worth it";
  return "Better to buy or hire out";
}

export function planQualityLabel(score: number): string {
  if (score >= 85) return "Strong plan";
  if (score >= 70) return "Good plan with assumptions";
  if (score >= 50) return "Needs user confirmation";
  return "Insufficient reference data";
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
