package com.lumen.service;

import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.repository.LearnerRepository;
import com.lumen.security.LearnerAuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerOnboardingService {
    private final LearnerRepository learnerRepository;
    private final LearnerAuthorizationService authorizationService;

    @Transactional
    public Learner create(OAuth2AuthenticationToken authentication, String displayName) {
        Learner learner = learnerRepository.save(new Learner(displayName));
        authorizationService.assignOwnerToCreator(authentication, learner);
        return learner;
    }

    public List<Learner> list(OAuth2AuthenticationToken authentication) {
        return authorizationService.listAccessibleLearners(authentication);
    }

    public Learner get(OAuth2AuthenticationToken authentication, UUID learnerId) {
        return authorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.VIEWER);
    }
}
