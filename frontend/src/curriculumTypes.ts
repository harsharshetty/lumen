export type CurriculumStatus = 'ACTIVE' | 'INACTIVE';

export type CurriculumDetailModel = {
  id: string;
  name: string;
  gradeLevel: string;
  subjectName: string;
  status: CurriculumStatus;
};

export type LearningConceptSummary = {
  id: string;
  name: string;
};

export type CurriculumFormValues = {
  name: string;
  gradeLevel: string;
  subjectId: string;
};

export type SubjectOption = {
  id: string;
  name: string;
};
