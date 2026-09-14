package com.lumen.service.impl;
import com.lumen.domain.*;
import com.lumen.repository.*;
import com.lumen.service.CurriculumConceptService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
@Service
@Transactional(readOnly = true)
public class CurriculumConceptServiceImpl implements CurriculumConceptService {
    private final CurriculumConceptRepository linkRepository;
    private final CurriculumRepository curriculumRepository;
    private final LearningConceptRepository conceptRepository;
    public CurriculumConceptServiceImpl(CurriculumConceptRepository linkRepository, CurriculumRepository curriculumRepository, LearningConceptRepository conceptRepository) { this.linkRepository = linkRepository; this.curriculumRepository = curriculumRepository; this.conceptRepository = conceptRepository; }
    @Override @Transactional public void addConcept(UUID curriculumId, UUID conceptId) {
        if (linkRepository.existsByCurriculumIdAndLearningConceptId(curriculumId, conceptId)) return;
        Curriculum curriculum = curriculumRepository.findById(curriculumId).orElseThrow(() -> new IllegalArgumentException("Curriculum not found: " + curriculumId));
        LearningConcept concept = conceptRepository.findById(conceptId).orElseThrow(() -> new IllegalArgumentException("Learning concept not found: " + conceptId));
        linkRepository.save(new CurriculumConcept(curriculum, concept));
    }
    @Override public List<LearningConcept> listConcepts(UUID curriculumId) { return linkRepository.findByCurriculumId(curriculumId).stream().map(CurriculumConcept::getLearningConcept).toList(); }
}
