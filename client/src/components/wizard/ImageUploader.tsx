import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

export type UploadedImageDraft = { name: string; dataUrl: string };

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function readFileAsDataUrl(file: File): Promise<UploadedImageDraft> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve({ name: file.name, dataUrl: reader.result });
      } else {
        reject(new Error(`Could not read ${file.name}`));
      }
    };
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImageDraft[];
  onChange: (images: UploadedImageDraft[]) => void;
}) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = ""; // allow re-picking the same file
    if (!files || files.length === 0) return;

    const nextWarnings: string[] = [];
    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        nextWarnings.push(`${file.name}: only JPG, PNG, or WebP images are supported.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        nextWarnings.push(
          `${file.name} is over 8 MB — resize it or take a screenshot of the product page instead.`
        );
        continue;
      }
      accepted.push(file);
    }
    setWarnings(nextWarnings);
    if (accepted.length === 0) return;

    try {
      const drafts = await Promise.all(accepted.map(readFileAsDataUrl));
      onChange([...imagesRef.current, ...drafts]);
    } catch (err) {
      setWarnings((w) => [...w, err instanceof Error ? err.message : "Could not read one of the files."]);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block cursor-pointer rounded-xl border-2 border-dashed border-bdr bg-parchment hover:border-pine-400 hover:bg-pine-50 transition-colors px-4 py-8 text-center">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={handleFiles}
        />
        <div className="text-3xl mb-1.5" aria-hidden>
          📷
        </div>
        <div className="text-sm font-medium text-ink">Upload photos of the piece</div>
        <div className="text-xs text-muted mt-1">
          JPG, PNG, or WebP · up to 8 MB each · product photos, screenshots, or your own snapshots
        </div>
      </label>

      {warnings.length > 0 && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w) => (
            <li key={w} className="text-xs text-warn flex items-start gap-1.5">
              <span aria-hidden>⚠️</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <li key={`${img.name}-${i}`} className="relative group">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="w-full h-24 object-cover rounded-lg border border-bdr bg-sand"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white text-xs grid place-items-center shadow-card hover:bg-danger transition-colors"
                aria-label={`Remove ${img.name}`}
              >
                ✕
              </button>
              <div className="text-[11px] text-muted truncate mt-1">{img.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
