import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LearnerCurriculumSelection, { type CurriculumChoice } from './LearnerCurriculumSelection';

const curricula: CurriculumChoice[] = [
  { id: 'math-cbse', name: 'CBSE Grade 3 Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'math-olympiad', name: 'Olympiad Mathematics', subject: 'Mathematics', gradeLevel: 'Grade 3' },
  { id: 'hindi-cbse', name: 'CBSE Grade 3 Hindi', subject: 'Hindi', gradeLevel: 'Grade 3' },
];

function renderSelection(options?: {
  viewState?: 'loading' | 'error' | 'forbidden' | 'ready';
  items?: CurriculumChoice[];
  initialSelectedIds?: string[];
  errorMessage?: string;
  onSave?: (selectedIds: string[]) => Promise<void>;
}) {
  const callbacks = {
    onRetry: vi.fn(),
    onBack: vi.fn(),
    onSave: options?.onSave ?? vi.fn(async () => undefined),
  };

  render(
    <LearnerCurriculumSelection
      learnerName="Anya"
      curricula={options?.items ?? curricula}
      initialSelectedIds={options?.initialSelectedIds}
      viewState={options?.viewState ?? 'ready'}
      errorMessage={options?.errorMessage}
      {...callbacks}
    />,
  );

  return callbacks;
}

afterEach(() => cleanup());

describe('LearnerCurriculumSelection', () => {
  it('renders a real loading state', () => {
    renderSelection({ viewState: 'loading' });

    expect(screen.getByLabelText('Loading curricula')).toBeInTheDocument();
    expect(screen.getByText('Loading curricula…')).toBeInTheDocument();
  });

  it('renders recoverable load error and retry', () => {
    const { onRetry } = renderSelection({ viewState: 'error', errorMessage: 'Catalog unavailable.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Catalog unavailable.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('uses safe default load-error copy when none is supplied', () => {
    renderSelection({ viewState: 'error' });
    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load curricula. Try again.");
  });

  it('renders forbidden without leaking learner details', () => {
    renderSelection({ viewState: 'forbidden' });

    expect(screen.getByRole('alert')).toHaveTextContent("You don't have access to this learner.");
    expect(screen.queryByText(/Choose curricula for Anya/)).not.toBeInTheDocument();
  });

  it('renders empty active catalog and allows back navigation without custom-curriculum behavior', () => {
    const { onBack, onSave } = renderSelection({ items: [] });

    expect(screen.getByRole('heading', { name: 'No curricula available yet' })).toBeInTheDocument();
    expect(screen.getByText("There aren't any active curricula available to select right now.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save curricula' })).toBeDisabled();
    expect(screen.queryByText(/custom curriculum/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows independent current selections and supports multiple curricula in one subject', async () => {
    const { onSave } = renderSelection({ initialSelectedIds: ['math-cbse', 'math-olympiad'] });

    expect(screen.getByRole('heading', { name: 'Choose curricula for Anya' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mathematics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hindi' })).toBeInTheDocument();

    const cbseMath = screen.getByRole('checkbox', { name: 'CBSE Grade 3 Mathematics, Grade 3' });
    const olympiadMath = screen.getByRole('checkbox', { name: 'Olympiad Mathematics, Grade 3' });
    const cbseHindi = screen.getByRole('checkbox', { name: 'CBSE Grade 3 Hindi, Grade 3' });

    expect(cbseMath).toBeChecked();
    expect(olympiadMath).toBeChecked();
    expect(cbseHindi).not.toBeChecked();

    fireEvent.click(cbseMath);
    fireEvent.click(cbseHindi);
    expect(cbseMath).not.toBeChecked();
    expect(olympiadMath).toBeChecked();
    expect(cbseHindi).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect([...onSave.mock.calls[0][0]].sort()).toEqual(['hindi-cbse', 'math-olympiad']);
    expect(await screen.findByText('Curricula updated')).toBeInTheDocument();

    fireEvent.click(cbseHindi);
    expect(screen.queryByText('Curricula updated')).not.toBeInTheDocument();
  });

  it('prevents duplicate interaction while saving and reports success accessibly', async () => {
    let resolveSave!: () => void;
    const pending = new Promise<void>((resolve) => { resolveSave = resolve; });
    const onSave = vi.fn(() => pending);
    const { onBack } = renderSelection({ onSave });

    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));

    expect(screen.getByRole('button', { name: 'Saving curricula' })).toBeDisabled();
    expect(screen.getByLabelText('Saving curricula progress')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'CBSE Grade 3 Mathematics, Grade 3' })).toBeDisabled();
    expect(onSave).toHaveBeenCalledOnce();
    expect(onBack).not.toHaveBeenCalled();

    resolveSave();
    expect(await screen.findByText('Curricula updated')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save curricula' })).toBeEnabled();
  });

  it('preserves selections after recoverable save failure and allows retry', async () => {
    const onSave = vi.fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(undefined);
    renderSelection({ onSave });

    const hindi = screen.getByRole('checkbox', { name: 'CBSE Grade 3 Hindi, Grade 3' });
    fireEvent.click(hindi);
    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to save curricula. Your selections have been kept so you can retry.',
    );
    expect(hindi).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: 'Save curricula' }));
    expect(await screen.findByText('Curricula updated')).toBeInTheDocument();
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(hindi).toBeChecked();
  });
});
