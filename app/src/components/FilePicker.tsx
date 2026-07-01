import { useRef, type ReactNode } from 'react';
import type { LoadedFile } from '../hooks/useRemapper';

export function FilePicker({
  onFiles,
  children,
  fullWidth = true,
}: {
  onFiles: (files: LoadedFile[]) => void;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(list: FileList) {
    const loaded = await Promise.all(
      Array.from(list).map(async (f) => ({
        bytes: new Uint8Array(await f.arrayBuffer()),
        name: f.name,
      })),
    );
    if (loaded.length) onFiles(loaded);
  }

  return (
    <>
      <button
        type="button"
        className={`
          cursor-pointer text-left
          ${fullWidth ? 'w-full' : ''}
        `}
        onClick={() => inputRef.current?.click()}
      >
        {children}
      </button>
      <input
        ref={inputRef}
        data-testid="file-input"
        type="file"
        accept=".mid,.midi"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handle(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
