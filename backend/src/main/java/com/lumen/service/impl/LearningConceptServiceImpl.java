package com.lumen.service.impl;

import com.lumen.domain.LearningConcept;
import com.lumen.repository.LearningConceptRepository;
import com.lumen.service.LearningConceptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LearningConceptServiceImpl implements LearningConceptService {
    private final LearningConceptRepository repository;

    @Override
    @Transactional
    public LearningConcept createLearningConcept(String name) {
        return repository.save(new LearningConcept(name));
    }

    @Override
    public LearningConcept getLearningConcept(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning concept not found: " + id));
    }

    @Override
    public List<LearningConcept> listLearningConcepts() {
        return repository.findAll();
    }
}
