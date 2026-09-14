package com.lumen.api;

import com.lumen.domain.CurriculumConcept;

import java.util.UUID;

public record LearningConceptResponse(UUID id, String name) {
    public static LearningConceptResponse from(CurriculumConcept association) {
        return new LearningConceptResponse(
                association.getLearningConcept().getId(),
                association.getLearningConcept().getName());
    }
}
