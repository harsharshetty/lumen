import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurriculumDetail from './CurriculumDetail';
import CurriculumForm from './CurriculumForm';
import type { CurriculumDetailModel } from './curriculumTypes';

afterEach(() => cleanup());

const curriculum: CurriculumDetailModel = {
  id: 'curriculum-1',
  name: 'CBSE Grade 3 Mathematics',
  gradeLevel: 'Grade 3',
  subjectName: 'Mathematics',
  status: 'ACTIVE',
};

const subjects = [{ id: 'math', name: 'Mathematics' }];

function chooseMathSubject() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /subject/i }));
  fireEvent.click(screen.getByRole('option', { name: 'Mathematics' }));
}

describe('CurriculumDetail', () => {
  it('renders loading, error, forbidden and not-found states', () => {
    const onRetry = vi.fn();
    const common = { curriculum: null, concepts: [], errorMessage: 'Unable to load.', onRetry, onEdit: vi.fn() };

    const { rerender } = render(<CurriculumDetail {...common} viewState="loading" />);
    expect(screen.getByLabelText('Loading curriculum')).toBeInTheDocument();

    rerender(<CurriculumDetail {...common} viewState="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();

    rerender(<CurriculumDetail {...common} viewState="forbidden" />);
    expect(screen.getByRole('alert')).toHaveTextContent('do not have access');

    rerender(<CurriculumDetail {...common} viewState="notFound" />);
    expect(screen.getByRole('alert')).toHaveTextContent('could not be found');

    rerender(<CurriculumDetail {...common} viewState="ready" />);
    expect(screen.getByRole('alert')).toHaveTextContent('could not be found');
  });

  it('renders approved metadata, concepts and edit action', () => {
    const onEdit = vi.fn();
    render(
      <CurriculumDetail
        curriculum={curriculum}
        concepts={[{ id: 'division', name: 'Division' }]}
        viewState="ready"
        errorMessage=""
        onRetry={vi.fn()}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByRole('heading', { name: curriculum.name })).toBeInTheDocument();
    expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Division')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit curriculum' }));
    expect(onEdit).toHaveBeenCalledWith('curriculum-1');
  });

  it('renders inactive and empty learning-concept states', () => {
    render(
      <CurriculumDetail
        curriculum={{ ...curriculum, status: 'INACTIVE' }}
        concepts={[]}
        viewState="ready"
        errorMessage=""
        onRetry={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Status: Inactive')).toBeInTheDocument();
    expect(screen.getByText(/No learning concepts are associated/i)).toBeInTheDocument();
  });
});

describe('CurriculumForm', () => {
  it('validates required approved fields before submission', () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(<CurriculumForm mode="create" subjects={subjects} onCancel={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create curriculum' }));

    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Grade level is required.')).toBeInTheDocument();
    expect(screen.getByText('Subject is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserves entered values after a recoverable save failure and supports cancel', async () => {
    const onCancel = vi.fn();
    const onSubmit = vi.fn(() => Promise.reject(new Error('network')));
    render(<CurriculumForm mode="create" subjects={subjects} onCancel={onCancel} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'CBSE Grade 3 Mathematics' } });
    fireEvent.change(screen.getByRole('textbox', { name: /grade level/i }), { target: { value: 'Grade 3' } });
    chooseMathSubject();
    fireEvent.click(screen.getByRole('button', { name: 'Create curriculum' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Your changes have been kept');
    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('CBSE Grade 3 Mathematics');
    expect(screen.getByRole('textbox', { name: /grade level/i })).toHaveValue('Grade 3');
    expect(screen.getByRole('combobox', { name: /subject/i })).toHaveTextContent('Mathematics');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('prevents duplicate submission while saving and reports create success', async () => {
    let resolveSave: (() => void) | undefined;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { resolveSave = resolve; }));
    render(<CurriculumForm mode="create" subjects={subjects} onCancel={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'CBSE Grade 3 Mathematics' } });
    fireEvent.change(screen.getByRole('textbox', { name: /grade level/i }), { target: { value: 'Grade 3' } });
    chooseMathSubject();
    fireEvent.click(screen.getByRole('button', { name: 'Create curriculum' }));

    expect(screen.getByLabelText('Saving curriculum')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saving curriculum/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledOnce();

    await act(async () => resolveSave?.());
    expect(await screen.findByRole('alert')).toHaveTextContent('Curriculum created.');
  });

  it('supports edit mode with existing approved fields', async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(
      <CurriculumForm
        mode="edit"
        subjects={subjects}
        initialValues={{ name: 'Old name', gradeLevel: 'Grade 3', subjectId: 'math' }}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Edit curriculum' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: /name/i }), { target: { value: 'New name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: 'New name', gradeLevel: 'Grade 3', subjectId: 'math' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Curriculum updated.');
  });
});
