import { Link } from "react-router-dom";

export function ExampleSavingsCard({
  emoji,
  from,
  to,
  note,
  href,
}: {
  emoji: string;
  /** The expensive inspiration, e.g. "$3,999 designer oak dining table". */
  from: string;
  /** The DIY outcome, e.g. "$580–$840 DIY build". */
  to: string;
  note?: string;
  /** Internal route — when set, the whole card links there. */
  href?: string;
}) {
  const body = (
    <>
      <div className="text-3xl mb-3" aria-hidden>
        {emoji}
      </div>
      <p className="text-sm text-muted line-through decoration-ember-400/70">{from}</p>
      <p className="text-faint text-xs my-1.5" aria-hidden>
        ↓
      </p>
      <p className="text-base font-semibold text-pine-700">{to}</p>
      {note && <p className="text-xs text-muted mt-2">{note}</p>}
      {href && <p className="text-xs font-medium text-ember-600 mt-3">See the full example plan →</p>}
    </>
  );

  const className = "card p-5 text-center h-full flex flex-col items-center justify-start";

  if (href) {
    return (
      <Link to={href} className={`${className} hover:shadow-lift hover:-translate-y-0.5 transition-all`}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
