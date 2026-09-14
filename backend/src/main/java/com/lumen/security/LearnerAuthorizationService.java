package com.lumen.security;

import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import com.lumen.repository.UserLearnerAccessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerAuthorizationService {
    private final AuthenticatedUserService authenticatedUserService;
    private final UserLearnerAccessRepository accessRepository;

    @Transactional
    public UserLearnerAccess assignOwnerToCreator(OAuth2AuthenticationToken authentication, Learner learner) {
        User user = authenticatedUserService.currentUser(authentication);
        return accessRepository.findByUserAndLearner(user, learner)
                .orElseGet(() -> accessRepository.save(new UserLearnerAccess(user, learner, LearnerAccessLevel.OWNER)));
    }

    public List<Learner> listAccessibleLearners(OAuth2AuthenticationToken authentication) {
        User user = authenticatedUserService.currentUser(authentication);
        return accessRepository.findAllByUser(user).stream()
                .map(UserLearnerAccess::getLearner)
                .toList();
    }

    public Learner requireAccess(OAuth2AuthenticationToken authentication,
                                 UUID learnerId,
                                 LearnerAccessLevel requiredLevel) {
        User user = authenticatedUserService.currentUser(authentication);
        UserLearnerAccess access = accessRepository.findByUserAndLearnerId(user, learnerId)
                .orElseThrow(() -> new AccessDeniedException("No access to learner"));
        if (!allows(access.getAccessLevel(), requiredLevel)) {
            throw new AccessDeniedException("Insufficient learner access");
        }
        return access.getLearner();
    }

    private boolean allows(LearnerAccessLevel actual, LearnerAccessLevel required) {
        return switch (actual) {
            case OWNER -> true;
            case CONTRIBUTOR -> required != LearnerAccessLevel.OWNER;
            case VIEWER -> required == LearnerAccessLevel.VIEWER;
        };
    }
}
