import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  engineDrums,
  engines as listEngines,
  plan as computePlan,
  ready,
  remap,
  type Drum,
  type Engine,
  type RemapReport,
  type VoiceRow,
} from '../lib/midiremap';
import { editsToOverrides, effectiveTgt, type Edits } from '../lib/overrides';
import { noteInOctave, octaveIndexOf } from '../lib/notes';

export interface LoadedFile {
  bytes: Uint8Array;
  name: string;
}

type Status = 'loading' | 'ready' | 'error';
type Conv = 'idle' | 'running' | 'done' | 'error';
type View = 'convert' | 'edit';
type Oct = 'c1' | 'c2';

export interface FileResult {
  name: string;
  url: string;
  bytes: Uint8Array;
  report: RemapReport;
}

export interface FileFailure {
  name: string;
  error: string;
}

function baseName(name: string): string {
  return name.replace(/\.midi?$/i, '');
}

export function useRemapper() {
  const [status, setStatus] = useState<Status>('loading');
  const [engines, setEngines] = useState<Engine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState('');
  const [tgt, setTgt] = useState('');
  const [oct, setOct] = useState<Oct>('c1');
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [view, setView] = useState<View>('convert');
  const [conv, setConv] = useState<Conv>('idle');
  const [results, setResults] = useState<FileResult[]>([]);
  const [failures, setFailures] = useState<FileFailure[]>([]);
  const [rows, setRows] = useState<VoiceRow[]>([]);
  const [edits, setEdits] = useState<Edits>({});
  const [pick, setPick] = useState<{ canon: string; octIndex: number } | null>(null);

  const clearResults = useCallback(() => {
    setResults((rs) => {
      rs.forEach((r) => URL.revokeObjectURL(r.url));
      return [];
    });
    setFailures([]);
  }, []);

  const refreshPlan = useCallback((s: string, t: string) => {
    if (s && t) setRows(computePlan(s, t));
  }, []);

  useEffect(() => {
    let cancelled = false;
    ready()
      .then(() => {
        if (cancelled) return;
        setEngines(listEngines());
        setStatus('ready');
      })
      .catch((e) => {
        if (!cancelled) {
          setError(String(e));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      setResults((rs) => {
        rs.forEach((r) => URL.revokeObjectURL(r.url));
        return rs;
      });
    };
  }, []);

  const chooseSrc = useCallback(
    (id: string) => {
      clearResults();
      setConv('idle');
      setEdits({});
      setPick(null);
      setSrc(id);
      refreshPlan(id, tgt);
    },
    [clearResults, refreshPlan, tgt],
  );

  const chooseTgt = useCallback(
    (id: string) => {
      clearResults();
      setConv('idle');
      setEdits({});
      setPick(null);
      setTgt(id);
      refreshPlan(src, id);
    },
    [clearResults, refreshPlan, src],
  );

  const swap = useCallback(() => {
    clearResults();
    setConv('idle');
    setEdits({});
    setPick(null);
    setSrc(tgt);
    setTgt(src);
    refreshPlan(tgt, src);
  }, [clearResults, refreshPlan, src, tgt]);

  const toggleOct = useCallback(() => setOct((o) => (o === 'c1' ? 'c2' : 'c1')), []);

  const addFiles = useCallback(
    (incoming: LoadedFile[]) => {
      clearResults();
      setError(null);
      setConv('idle');
      setFiles((prev) => {
        const names = new Set(prev.map((f) => f.name));
        return [...prev, ...incoming.filter((f) => !names.has(f.name))];
      });
    },
    [clearResults],
  );

  const removeFile = useCallback(
    (name: string) => {
      clearResults();
      setConv('idle');
      setFiles((prev) => prev.filter((f) => f.name !== name));
    },
    [clearResults],
  );

  const clearFiles = useCallback(() => {
    clearResults();
    setConv('idle');
    setFiles([]);
  }, [clearResults]);

  const convert = useCallback(() => {
    if (files.length === 0 || !src || !tgt) return;
    clearResults();
    setConv('running');
    setError(null);
    const ov = editsToOverrides(edits);
    const ok: FileResult[] = [];
    const bad: FileFailure[] = [];
    for (const f of files) {
      try {
        const { bytes, report } = remap(f.bytes, src, tgt, ov);
        const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/midi' }));
        ok.push({ name: `${baseName(f.name)}-${tgt}.mid`, url, bytes, report });
      } catch (e) {
        bad.push({ name: f.name, error: String(e) });
      }
    }
    setResults(ok);
    setFailures(bad);
    if (bad.length > 0 && ok.length === 0) setError(bad[0].error);
    setConv(ok.length > 0 ? 'done' : 'error');
  }, [clearResults, edits, files, src, tgt]);

  const reset = useCallback(() => {
    clearResults();
    setConv('idle');
  }, [clearResults]);

  const openPick = useCallback(
    (canon: string) => {
      const row = rows.find((r) => r.canon === canon);
      if (!row) return;
      const note = edits[canon] ?? row.tgtNote ?? row.srcNote;
      setPick({ canon, octIndex: octaveIndexOf(note) });
    },
    [edits, rows],
  );

  const setPickOct = useCallback((octIndex: number) => {
    setPick((p) => (p ? { ...p, octIndex } : p));
  }, []);

  const chooseNote = useCallback(
    (semitone: number) => {
      if (!pick) return;
      setEdits((e) => ({ ...e, [pick.canon]: noteInOctave(pick.octIndex, semitone) }));
      setPick(null);
    },
    [pick],
  );

  const chooseNoteAbsolute = useCallback(
    (note: number) => {
      if (!pick) return;
      setEdits((e) => ({ ...e, [pick.canon]: note }));
      setPick(null);
    },
    [pick],
  );

  const closePick = useCallback(() => setPick(null), []);

  const remappedCount = useMemo(
    () => rows.filter((r) => r.status !== 'dropped' && effectiveTgt(r, edits) !== r.srcNote).length,
    [rows, edits],
  );
  const droppedCount = useMemo(() => rows.filter((r) => r.status === 'dropped').length, [rows]);
  const targetDrums = useMemo<Drum[]>(() => {
    if (status !== 'ready' || !tgt) return [];
    try {
      return engineDrums(tgt);
    } catch {
      return [];
    }
  }, [status, tgt]);

  return {
    status,
    engines,
    targetDrums,
    error,
    src,
    tgt,
    oct,
    files,
    view,
    conv,
    results,
    failures,
    rows,
    edits,
    remappedCount,
    droppedCount,
    voiceCount: rows.length,
    chooseSrc,
    chooseTgt,
    swap,
    toggleOct,
    addFiles,
    removeFile,
    clearFiles,
    setView,
    convert,
    reset,
    pick,
    openPick,
    setPickOct,
    chooseNote,
    chooseNoteAbsolute,
    closePick,
  };
}
