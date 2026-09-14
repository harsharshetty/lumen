package com.lumen.service.impl;
import com.lumen.domain.*;
import com.lumen.repository.*;
import com.lumen.service.LearnerCurriculumService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
@Service
@Transactional(readOnly = true)
public class LearnerCurriculumServiceImpl implements LearnerCurriculumService {
    private final LearnerCurriculumRepository linkRepository;
    private final LearnerRepository learnerRepository;
    private final CurriculumRepository curriculumRepository;
    public LearnerCurriculumServiceImpl(LearnerCurriculumRepository linkRepository, LearnerRepository learnerRepository, CurriculumRepository curriculumRepository) { this.linkRepository = linkRepository; this.learnerRepository = learnerRepository; this.curriculumRepository = curriculumRepository; }
    @Override @Transactional public void addCurriculum(UUID learnerId, UUID curriculumId) {
        if (linkRepository.existsByLearnerIdAndCurriculumId(learnerId, curriculumId)) return;
        Learner learner = learnerRepository.findById(learnerId).orElseThrow(() -> new IllegalArgumentException("Learner not found: " + learnerId));
        Curriculum curriculum = curriculumRepository.findById(curriculumId).orElseThrow(() -> new IllegalArgumentException("Curriculum not found: " + curriculumId));
        linkRepository.save(new LearnerCurriculum(learner, curriculum));
    }
    @Override public List<Curriculum> listCurricula(UUID learnerId) { return linkRepository.findByLearnerId(learnerId).stream().map(LearnerCurriculum::getCurriculum).toList(); }
}
