package com.lumen.service.impl;

import com.lumen.domain.Curriculum;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerCurriculum;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearnerCurriculumRepository;
import com.lumen.repository.LearnerRepository;
import com.lumen.service.LearnerCurriculumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LearnerCurriculumServiceImpl implements LearnerCurriculumService {
    private final LearnerCurriculumRepository learnerCurriculumRepository;
    private final LearnerRepository learnerRepository;
    private final CurriculumRepository curriculumRepository;

    @Override
    @Transactional
    public void enrollLearnerInCurriculum(UUID learnerId, UUID curriculumId) {
        if (learnerCurriculumRepository.existsByLearnerIdAndCurriculumId(learnerId, curriculumId)) {
            return;
        }

        Learner learner = learnerRepository.findById(learnerId)
                .orElseThrow(() -> new IllegalArgumentException("Learner not found: " + learnerId));
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new IllegalArgumentException("Curriculum not found: " + curriculumId));

        learnerCurriculumRepository.save(new LearnerCurriculum(learner, curriculum));
    }

    @Override
    public List<Curriculum> listCurriculaForLearner(UUID learnerId) {
        return learnerCurriculumRepository.findByLearnerId(learnerId).stream()
                .map(LearnerCurriculum::getCurriculum)
                .toList();
    }
}
