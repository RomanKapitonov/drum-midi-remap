import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilePicker } from '../src/components/FilePicker';

describe('FilePicker', () => {
  it('reads multiple chosen files into byte arrays', async () => {
    const onFiles = vi.fn();
    render(<FilePicker onFiles={onFiles}>choose</FilePicker>);
    const input = screen.getByTestId('file-input') as HTMLInputElement;
    await userEvent.upload(input, [
      new File([new Uint8Array([1, 2])], 'a.mid', { type: 'audio/midi' }),
      new File([new Uint8Array([3])], 'b.mid', { type: 'audio/midi' }),
    ]);
    await waitFor(() => expect(onFiles).toHaveBeenCalledTimes(1));
    const arg = onFiles.mock.calls[0][0];
    expect(arg.map((f: { name: string }) => f.name)).toEqual(['a.mid', 'b.mid']);
    expect(Array.from(arg[0].bytes)).toEqual([1, 2]);
  });
});
