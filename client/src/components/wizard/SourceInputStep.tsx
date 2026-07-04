import { ImageUploader } from "@/components/wizard/ImageUploader";
import type { UploadedImageDraft } from "@/components/wizard/ImageUploader";

export type SourceInputValue = {
  sourceUrl: string;
  images: UploadedImageDraft[];
  description: string;
  pastedText: string;
};

export function SourceInputStep({
  value,
  onChange,
  onNext,
}: {
  value: SourceInputValue;
  onChange: (value: SourceInputValue) => void;
  onNext: () => void;
}) {
  const set = (patch: Partial<SourceInputValue>) => onChange({ ...value, ...patch });

  const hasInput =
    value.sourceUrl.trim().length > 0 ||
    value.images.length > 0 ||
    value.description.trim().length > 0 ||
    value.pastedText.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">What are we duping?</h2>
        <p className="text-sm text-muted mt-1">
          Add the expensive piece you want an inspired-by build plan for. A link, photos, a
          description — any one of them works, and more input means a better plan.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="source-url">
          🔗 Product link
        </label>
        <input
          id="source-url"
          type="url"
          className="input"
          placeholder="Paste a link from Pottery Barn, Etsy, Pinterest, West Elm, Amazon…"
          value={value.sourceUrl}
          onChange={(e) => set({ sourceUrl: e.target.value })}
        />
        <p className="text-xs text-muted mt-1.5">
          Blocked or paywalled link? No problem — screenshots and a quick description work just as
          well.
        </p>
      </div>

      <div>
        <span className="label">📷 Photos</span>
        <ImageUploader images={value.images} onChange={(images) => set({ images })} />
      </div>

      <div>
        <label className="label" htmlFor="source-description">
          💬 Description
        </label>
        <textarea
          id="source-description"
          className="input min-h-24"
          rows={3}
          placeholder="Describe what you want to recreate… e.g. “72-inch white oak dining table, chunky 3-inch legs, waterfall edge, light natural finish”"
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </div>

      <div>
        <label className="label" htmlFor="source-pasted">
          📦 Pasted product-page text <span className="font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="source-pasted"
          className="input min-h-24 font-mono text-xs"
          rows={4}
          placeholder="Copy and paste the product page — title, price, dimensions, materials — and we'll extract the specs."
          value={value.pastedText}
          onChange={(e) => set({ pastedText: e.target.value })}
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-bdr">
        <p className="text-xs text-muted">
          {hasInput ? (
            <span className="text-pine-700">✅ Ready to continue</span>
          ) : (
            "Add at least one input — a link, a photo, or a description — to continue."
          )}
        </p>
        <button type="button" className="btn-primary btn-lg" onClick={onNext} disabled={!hasInput}>
          Continue →
        </button>
      </div>
    </div>
  );
}
