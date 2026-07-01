import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConvertButton } from '../src/components/ConvertButton';
import { SummaryRow } from '../src/components/SummaryRow';

describe('SummaryRow', () => {
  it('shows counts and fires edit', async () => {
    const onEdit = vi.fn();
    render(<SummaryRow remapped={3} total={14} onEdit={onEdit} />);
    expect(screen.getByText(/of 14 drums remapped/)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Edit individual notes/));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe('ConvertButton', () => {
  it('disables convert without a file', () => {
    render(
      <ConvertButton
        conv="idle"
        canConvert={false}
        results={[]}
        targetShort=""
        summary=""
        onConvert={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Convert & download/i })).toBeDisabled();
  });

  it('fires convert when enabled', async () => {
    const onConvert = vi.fn();
    render(
      <ConvertButton
        conv="idle"
        canConvert
        results={[]}
        targetShort=""
        summary=""
        onConvert={onConvert}
        onReset={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Convert & download/i }));
    expect(onConvert).toHaveBeenCalledOnce();
  });

  it('renders a single .mid link for one result', () => {
    render(
      <ConvertButton
        conv="done"
        canConvert
        results={[{ name: 'groove-ezd.mid', url: 'blob:x', bytes: new Uint8Array([1]) }]}
        targetShort="EZD"
        summary="1 file · 3 remapped → EZD"
        onConvert={() => {}}
        onReset={() => {}}
      />,
    );
    const link = screen.getByRole('link', { name: /download .mid/i });
    expect(link).toHaveAttribute('href', 'blob:x');
    expect(link).toHaveAttribute('download', 'groove-ezd.mid');
  });

  it('renders a zip link for multiple results', () => {
    render(
      <ConvertButton
        conv="done"
        canConvert
        results={[
          { name: 'a.mid', url: 'blob:a', bytes: new Uint8Array([1]) },
          { name: 'b.mid', url: 'blob:b', bytes: new Uint8Array([2]) },
        ]}
        targetShort="EZD"
        summary="2 files · 6 remapped → EZD"
        onConvert={() => {}}
        onReset={() => {}}
      />,
    );
    expect(screen.getByRole('link', { name: /download all \(\.zip\)/i })).toHaveAttribute(
      'download',
      'remapped-EZD.zip',
    );
  });
});
