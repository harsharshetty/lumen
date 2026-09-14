package com.lumen.service;

import com.lumen.domain.Curriculum;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.LearnerCurriculum;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearnerCurriculumRepository;
import com.lumen.security.LearnerAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerCurriculumSelectionService {
    private final LearnerAuthorizationService learnerAuthorizationService;
    private final LearnerCurriculumRepository learnerCurriculumRepository;
    private final CurriculumRepository curriculumRepository;

    @Transactional(readOnly = true)
    public List<Curriculum> list(OAuth2AuthenticationToken authentication, UUID learnerId) {
        learnerAuthorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.VIEWER);
        return learnerCurriculumRepository.findByLearnerId(learnerId).stream()
                .map(LearnerCurriculum::getCurriculum)
                .toList();
    }

    @Transactional
    public Curriculum add(OAuth2AuthenticationToken authentication, UUID learnerId, UUID curriculumId) {
        Learner learner = learnerAuthorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.CONTRIBUTOR);
        Curriculum curriculum = curriculumRepository.findById(curriculumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curriculum not found"));
        if (!curriculum.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inactive curriculum cannot be selected");
        }
        return learnerCurriculumRepository.findByLearnerIdAndCurriculumId(learnerId, curriculumId)
                .map(LearnerCurriculum::getCurriculum)
                .orElseGet(() -> learnerCurriculumRepository.save(new LearnerCurriculum(learner, curriculum)).getCurriculum());
    }

    @Transactional
    public void remove(OAuth2AuthenticationToken authentication, UUID learnerId, UUID curriculumId) {
        learnerAuthorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.CONTRIBUTOR);
        LearnerCurriculum association = learnerCurriculumRepository.findByLearnerIdAndCurriculumId(learnerId, curriculumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner curriculum selection not found"));
        learnerCurriculumRepository.delete(association);
    }
}
