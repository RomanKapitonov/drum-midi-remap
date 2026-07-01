import { useRef } from "react";
import { useDismiss } from "../hooks/useDismiss";
import type { Drum } from "../lib/midiremap";
import { noteName, octaveTabLabel, type OctaveBase } from "../lib/notes";
import { DrumList } from "./DrumList";
import { PianoKeyboard } from "./PianoKeyboard";

const OCT_INDICES = [-1, 0, 1, 2, 3, 4, 5, 6, 7];

export function NotePicker({
  voiceLabel,
  currentNote,
  octIndex,
  base,
  drums,
  onSetOct,
  onPick,
  onPickDrum,
  onClose,
}: {
  voiceLabel: string;
  currentNote: number;
  octIndex: number;
  base: OctaveBase;
  drums: Drum[];
  onSetOct: (octIndex: number) => void;
  onPick: (semitone: number) => void;
  onPickDrum: (note: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, onClose);
  return (
    <div
      ref={ref}
      className="
        my-0.5 mb-3 rounded-[10px] border border-accent/18 bg-white/[0.018]
        p-[13px_14px_16px]
      "
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2.25">
          <span className="font-mono text-[9.5px] tracking-[0.12em] text-t4">
            TARGET · {voiceLabel}
          </span>
          <span className="font-mono text-[15px] font-bold text-accent">
            {noteName(currentNote, base)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="
            flex size-5 items-center justify-center rounded-[5px] bg-white/5
            text-[14px] text-t4
          "
        >
          ×
        </button>
      </div>
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <DrumList
            drums={drums}
            currentNote={currentNote}
            base={base}
            onPick={onPickDrum}
          />
        </div>
        <div className="flex w-105 shrink-0 flex-col gap-3.25">
          <div className="flex flex-wrap justify-end gap-1.5">
            {OCT_INDICES.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => onSetOct(o)}
                className={`
                  rounded-md border px-2.75 py-1.25 font-mono text-[11px]
                  font-semibold
                  ${
                    o === octIndex
                      ? "border-accent bg-accent/15 text-t1"
                      : `border-white/8 text-t4`
                  }
                `}
              >
                {octaveTabLabel(o, base)}
              </button>
            ))}
          </div>
          <PianoKeyboard
            octIndex={octIndex}
            currentNote={currentNote}
            onPick={onPick}
          />
        </div>
      </div>
    </div>
  );
}
