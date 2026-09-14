package com.lumen.service.impl;

import com.lumen.domain.Curriculum;
import com.lumen.domain.CurriculumConcept;
import com.lumen.domain.LearningConcept;
import com.lumen.repository.CurriculumConceptRepository;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearningConceptRepository;
import com.lumen.service.CurriculumConceptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CurriculumConceptServiceImpl implements CurriculumConceptService {
    private final CurriculumConceptRepository curriculumConceptRepository;
    private final CurriculumRepository curriculumRepository;
    private final LearningConceptRepository learningConceptRepository;

    @Override
    @Transactional
    public void addLearningConceptToCurriculum(UUID curriculumId, UUID learningConceptId) {
        if (curriculumConceptRepository.existsByCurriculumIdAndLearningConceptId(curriculumId, learningConceptId)) {
            return;
        }

        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("Curriculum not found: " + curriculumId));
        LearningConcept learningConcept = learningConceptRepository.findById(learningConceptId)
                .orElseThrow(() -> new IllegalArgumentException("Learning concept not found: " + learningConceptId));

        curriculumConceptRepository.save(new CurriculumConcept(curriculum, learningConcept));
    }

    @Override
    public List<LearningConcept> listLearningConceptsForCurriculum(UUID curriculumId) {
        return curriculumConceptRepository.findByCurriculumId(curriculumId).stream()
                .map(CurriculumConcept::getLearningConcept)
                .toList();
    }
}
