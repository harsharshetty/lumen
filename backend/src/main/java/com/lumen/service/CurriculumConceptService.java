package com.lumen.service;

import com.lumen.domain.LearningConcept;

import java.util.List;
import java.util.UUID;

public interface CurriculumConceptService {
    void addLearningConceptToCurriculum(UUID curriculumId, UUID learningConceptId);
    List<LearningConcept> listLearningConceptsForCurriculum(UUID curriculumId);
}
