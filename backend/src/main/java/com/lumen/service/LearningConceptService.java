package com.lumen.service;

import com.lumen.domain.LearningConcept;

import java.util.List;
import java.util.UUID;

public interface LearningConceptService {
    LearningConcept createLearningConcept(String name);
    LearningConcept getLearningConcept(UUID id);
    List<LearningConcept> listLearningConcepts();
}
