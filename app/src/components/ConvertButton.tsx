import { zipFiles } from '../lib/zip';

type Conv = 'idle' | 'running' | 'done' | 'error';

export function ConvertButton({
  conv,
  canConvert,
  results,
  targetShort,
  summary,
  onConvert,
  onReset,
}: {
  conv: Conv;
  canConvert: boolean;
  results: { name: string; url: string; bytes: Uint8Array }[];
  targetShort: string;
  summary: string;
  onConvert: () => void;
  onReset: () => void;
}) {
  if (conv === 'done' && results.length > 0) {
    const single = results.length === 1;
    const href = single ? results[0].url : URL.createObjectURL(zipFiles(results));
    const name = single ? results[0].name : `remapped-${targetShort}.zip`;
    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.75">
          <a href={href} download={name} className="
            text-[13.5px] font-semibold text-t1
          ">
            {single ? '↓ download .mid' : '↓ download all (.zip)'}
          </a>
          <span className="font-mono text-[11px] text-t4">{summary}</span>
        </div>
        <button type="button" onClick={onReset} className="
          text-[12px] text-t4
          hover:text-t1
        ">
          again
        </button>
      </div>
    );
  }
  if (conv === 'running') {
    return (
      <div>
        <div className="
          mb-2.25 flex justify-between font-mono text-[11px] text-t4
        ">
          <span>remapping</span>
          <span className="text-accent">…</span>
        </div>
        <div className="h-0.5 overflow-hidden bg-white/8">
          <div className="h-full w-1/3 animate-pulse bg-accent" />
        </div>
      </div>
    );
  }
  return (
    <button
      type="button"
      disabled={!canConvert}
      onClick={onConvert}
      className="
        rounded-[11px] border border-accent py-3.5 text-center font-display
        text-[13.5px] font-semibold text-accent transition-colors
        enabled:hover:bg-accent enabled:hover:text-ink
        disabled:opacity-40
      "
    >
      Convert &amp; download
    </button>
  );
}
