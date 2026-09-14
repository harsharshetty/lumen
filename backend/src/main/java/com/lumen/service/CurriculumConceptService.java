package com.lumen.service;
import com.lumen.domain.LearningConcept;
import java.util.List;
import java.util.UUID;
public interface CurriculumConceptService {
    void addConcept(UUID curriculumId, UUID conceptId);
    List<LearningConcept> listConcepts(UUID curriculumId);
}
