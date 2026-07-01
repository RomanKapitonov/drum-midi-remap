import type { LoadedFile } from '../hooks/useRemapper';
import { FilePicker } from './FilePicker';

export function FileChips({
  files,
  failures,
  onFiles,
  onRemove,
  onClear,
}: {
  files: LoadedFile[];
  failures: { name: string }[];
  onFiles: (files: LoadedFile[]) => void;
  onRemove: (name: string) => void;
  onClear: () => void;
}) {
  if (files.length === 0) {
    return (
      <FilePicker onFiles={onFiles}>
        <div className="flex items-center gap-3 border-b border-white/6 pb-4.5">
          <span className="font-mono text-[11px] font-semibold text-accent">MID</span>
          <span className="flex-1 text-[14px] text-t4">
            Drop a .mid anywhere, or click to choose
          </span>
        </div>
      </FilePicker>
    );
  }
  const failed = new Set(failures.map((f) => f.name));
  return (
    <div className="
      flex flex-wrap items-center gap-2 border-b border-white/6 pb-4.5
    ">
      {files.map((f) => {
        const bad = failed.has(f.name);
        return (
          <div
            key={f.name}
            className={`
              flex max-w-full items-center gap-1.5 rounded-[7px] border py-1
              pr-1.5 pl-2.5
              ${
                bad
                  ? 'border-danger/40 bg-danger/5'
                  : `border-white/8 bg-white/2.5`
              }
            `}
          >
            <span className="font-mono text-[11px] font-semibold text-accent">MID</span>
            <span className="h-3.5 w-px shrink-0 bg-white/12" />
            <span className="min-w-0 truncate text-[12px] text-t1">{f.name}</span>
            <button
              type="button"
              aria-label={`Remove ${f.name}`}
              onClick={() => onRemove(f.name)}
              className="
                flex size-4 shrink-0 items-center justify-center rounded-full
                text-[12px] leading-none text-t5
                hover:bg-white/8 hover:text-danger
              "
            >
              ×
            </button>
          </div>
        );
      })}
      <div className="flex w-full items-center justify-between pt-0.5">
        <FilePicker onFiles={onFiles} fullWidth={false}>
          <span className="
            text-[11px] text-t5
            hover:text-accent
          ">
            + add more
          </span>
        </FilePicker>
        <button
          type="button"
          onClick={onClear}
          className="
            text-[11px] text-danger/60 transition-colors
            hover:text-danger
          "
        >
          clear all
        </button>
      </div>
    </div>
  );
}
