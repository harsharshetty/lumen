import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LearnerForm from './LearnerForm';
import LearnerLanding from './LearnerLanding';
import type { LearnerSummary } from './learnerTypes';

const learners: LearnerSummary[] = [
  { id: 'learner-1', displayName: 'Aarav' },
  { id: 'learner-2', displayName: 'Mira' },
];

afterEach(() => {
  cleanup();
});

function renderLanding(state: 'loading' | 'error' | 'forbidden' | 'ready', items?: LearnerSummary[]) {
  const callbacks = {
    onRetry: vi.fn(),
    onAddLearner: vi.fn(),
    onOpenLearner: vi.fn(),
  };

  render(
    <LearnerLanding
      state={state}
      learners={items}
      {...callbacks}
    />,
  );

  return callbacks;
}

describe('LearnerLanding', () => {
  it('shows a genuine learner loading state', () => {
    renderLanding('loading');

    expect(screen.getByLabelText('Loading learners')).toBeInTheDocument();
    expect(screen.getByText('Loading your learners…')).toBeInTheDocument();
    expect(screen.queryByText('Add your first learner')).not.toBeInTheDocument();
  });

  it('shows a recoverable load error and retries', () => {
    const { onRetry } = renderLanding('error');

    expect(screen.getByRole('alert')).toHaveTextContent("We couldn't load your learners. Try again.");
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows a safe forbidden state without learner details', () => {
    renderLanding('forbidden');

    expect(screen.getByRole('alert')).toHaveTextContent("You don't have access to this learner.");
    expect(screen.queryByText('Aarav')).not.toBeInTheDocument();
  });

  it('shows the frozen first-time parent empty state and starts learner creation', () => {
    const { onAddLearner } = renderLanding('ready');

    expect(screen.getByRole('heading', { name: 'Add your first learner' })).toBeInTheDocument();
    expect(screen.getByText('Create a learner profile to start choosing the curricula you want to follow.')).toBeInTheDocument();
    expect(screen.getByText('Choose curricula')).toBeInTheDocument();
    expect(screen.queryByText("Today's focus")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add learner' }));
    expect(onAddLearner).toHaveBeenCalledOnce();
  });

  it('shows only real learner profiles without fabricated progress and supports add/open actions', () => {
    const { onAddLearner, onOpenLearner } = renderLanding('ready', learners);

    expect(screen.getByRole('heading', { name: 'Learners' })).toBeInTheDocument();
    expect(screen.getByText('Aarav')).toBeInTheDocument();
    expect(screen.getByText('Mira')).toBeInTheDocument();
    expect(screen.getAllByText('Learner profile')).toHaveLength(2);
    expect(screen.queryByText(/6\s*\/\s*10/)).not.toBeInTheDocument();
    expect(screen.queryByText("Today's focus")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add learner' }));
    expect(onAddLearner).toHaveBeenCalledOnce();

    const openButtons = screen.getAllByRole('button', { name: 'Open' });
    fireEvent.click(openButtons[1]);
    expect(onOpenLearner).toHaveBeenCalledWith(learners[1]);
  });
});

describe('LearnerForm', () => {
  it('validates the minimal learner name before submission', () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<LearnerForm onCancel={vi.fn()} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Learner name/), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create learner' }));

    expect(screen.getByText('Learner name is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims the learner name, prevents duplicate interaction while saving, and reports success', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    }));
    const onCancel = vi.fn();

    render(<LearnerForm onCancel={onCancel} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText(/Learner name/), { target: { value: '  Aarav  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create learner' }));

    expect(onSubmit).toHaveBeenCalledWith('Aarav');
    expect(screen.getByRole('button', { name: 'Creating learner' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    resolveSubmit?.();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Learner added'));
    expect(screen.getByRole('button', { name: 'Create learner' })).toBeEnabled();
  });

  it('preserves the learner name after a recoverable save failure', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network'));

    render(<LearnerForm onCancel={vi.fn()} onSubmit={onSubmit} />);
    const nameField = screen.getByLabelText(/Learner name/);
    fireEvent.change(nameField, { target: { value: 'Mira' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create learner' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent("We couldn't add this learner."));
    expect(nameField).toHaveValue('Mira');
  });

  it('supports cancelling before submission', () => {
    const onCancel = vi.fn();

    render(<LearnerForm onCancel={onCancel} onSubmit={vi.fn().mockResolvedValue(undefined)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
