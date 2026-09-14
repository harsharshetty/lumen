package com.lumen.service.impl;
import com.lumen.domain.LearningConcept;
import com.lumen.repository.LearningConceptRepository;
import com.lumen.service.LearningConceptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
@Service
@Transactional(readOnly = true)
public class LearningConceptServiceImpl implements LearningConceptService {
    private final LearningConceptRepository repository;
    public LearningConceptServiceImpl(LearningConceptRepository repository) { this.repository = repository; }
    @Override @Transactional public LearningConcept create(String name) { return repository.save(new LearningConcept(name)); }
    @Override public LearningConcept get(UUID id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Learning concept not found: " + id)); }
    @Override public List<LearningConcept> list() { return repository.findAll(); }
}
