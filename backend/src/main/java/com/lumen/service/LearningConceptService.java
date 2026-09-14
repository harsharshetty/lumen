package com.lumen.service;
import com.lumen.domain.LearningConcept;
import java.util.List;
import java.util.UUID;
public interface LearningConceptService {
    LearningConcept create(String name);
    LearningConcept get(UUID id);
    List<LearningConcept> list();
}
