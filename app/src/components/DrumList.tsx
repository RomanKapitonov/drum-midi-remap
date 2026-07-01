import { noteName, type OctaveBase } from '../lib/notes';

interface Drum {
  note: number;
  canon: string;
  label: string;
  family: string;
}

const FAMILY_ORDER = ['Kick', 'Snare', 'Toms', 'Hi-Hat', 'Cymbals', 'Percussion', 'Aux'];

export function DrumList({
  drums,
  currentNote,
  base,
  onPick,
}: {
  drums: Drum[];
  currentNote: number;
  base: OctaveBase;
  onPick: (note: number) => void;
}) {
  const groups = FAMILY_ORDER.map((family) => ({
    family,
    items: drums.filter((d) => d.family === family),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mr-scroll flex max-h-64 flex-col gap-2 pr-1">
      {groups.map((g) => (
        <div key={g.family}>
          <div className="mb-1 font-mono text-[10px] tracking-[0.14em] text-t5">
            {g.family}
          </div>
          {g.items.map((d) => {
            const sel = d.note === currentNote;
            return (
              <button
                key={d.canon}
                type="button"
                aria-pressed={sel}
                onClick={() => onPick(d.note)}
                className={`
                  flex w-full items-center justify-between border-l-2 py-1 pr-2
                  pl-2.5 text-left text-[12px] leading-tight transition-colors
                  ${
                  sel
                    ? "border-accent font-semibold text-t1"
                    : `
                      border-transparent text-t4
                      hover:text-t1
                    `
                }
                `}
              >
                <span className="min-w-0 truncate">{d.label}</span>
                <span className="ml-2 shrink-0 font-mono text-[11px] text-t5">
                  {noteName(d.note, base)}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
