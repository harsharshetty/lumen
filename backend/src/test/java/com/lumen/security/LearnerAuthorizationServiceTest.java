package com.lumen.security;

import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import com.lumen.domain.UserRole;
import com.lumen.repository.UserLearnerAccessRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LearnerAuthorizationServiceTest {

    private final AuthenticatedUserService authenticatedUsers = mock(AuthenticatedUserService.class);
    private final UserLearnerAccessRepository accesses = mock(UserLearnerAccessRepository.class);
    private final LearnerAuthorizationService service = new LearnerAuthorizationService(authenticatedUsers, accesses);
    private final OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
    private final User user = new User("Parent", UserRole.USER);

    @Test
    void assignsOwnerToCreatorAndIsIdempotent() {
        Learner learner = new Learner("Child");
        UserLearnerAccess existing = new UserLearnerAccess(user, learner, LearnerAccessLevel.OWNER);
        when(authenticatedUsers.currentUser(authentication)).thenReturn(user);
        when(accesses.findByUserAndLearner(user, learner))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(existing));
        when(accesses.save(any(UserLearnerAccess.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserLearnerAccess created = service.assignOwnerToCreator(authentication, learner);
        UserLearnerAccess resolved = service.assignOwnerToCreator(authentication, learner);

        assertThat(created.getUser()).isSameAs(user);
        assertThat(created.getLearner()).isSameAs(learner);
        assertThat(created.getAccessLevel()).isEqualTo(LearnerAccessLevel.OWNER);
        assertThat(resolved).isSameAs(existing);
        verify(accesses).save(any(UserLearnerAccess.class));
    }

    @Test
    void listsOnlyLearnersFromCurrentUsersAccessRecords() {
        Learner first = new Learner("First");
        Learner second = new Learner("Second");
        when(authenticatedUsers.currentUser(authentication)).thenReturn(user);
        when(accesses.findAllByUser(user)).thenReturn(List.of(
                new UserLearnerAccess(user, first, LearnerAccessLevel.OWNER),
                new UserLearnerAccess(user, second, LearnerAccessLevel.VIEWER)));

        assertThat(service.listAccessibleLearners(authentication)).containsExactly(first, second);
    }

    @Test
    void ownerCanSatisfyOwnerRequirement() {
        Learner learner = learnerWithAccess(LearnerAccessLevel.OWNER);

        assertThat(service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.OWNER)).isSameAs(learner);
    }

    @Test
    void contributorCanReadAndContributeButCannotOwn() {
        Learner learner = learnerWithAccess(LearnerAccessLevel.CONTRIBUTOR);

        assertThat(service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.VIEWER)).isSameAs(learner);
        assertThat(service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.CONTRIBUTOR)).isSameAs(learner);
        assertThatThrownBy(() -> service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.OWNER))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Insufficient learner access");
    }

    @Test
    void viewerCanReadButCannotContributeOrOwn() {
        Learner learner = learnerWithAccess(LearnerAccessLevel.VIEWER);

        assertThat(service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.VIEWER)).isSameAs(learner);
        assertThatThrownBy(() -> service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.CONTRIBUTOR))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Insufficient learner access");
        assertThatThrownBy(() -> service.requireAccess(authentication, learner.getId(), LearnerAccessLevel.OWNER))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Insufficient learner access");
    }

    @Test
    void deniesDirectLearnerLookupWithoutAccessRecord() {
        UUID learnerId = UUID.randomUUID();
        when(authenticatedUsers.currentUser(authentication)).thenReturn(user);
        when(accesses.findByUserAndLearnerId(user, learnerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.requireAccess(authentication, learnerId, LearnerAccessLevel.VIEWER))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("No access to learner");
        verify(accesses, never()).save(any());
    }

    private Learner learnerWithAccess(LearnerAccessLevel accessLevel) {
        Learner learner = mock(Learner.class);
        UUID learnerId = UUID.randomUUID();
        when(learner.getId()).thenReturn(learnerId);
        when(authenticatedUsers.currentUser(authentication)).thenReturn(user);
        when(accesses.findByUserAndLearnerId(user, learnerId))
                .thenReturn(Optional.of(new UserLearnerAccess(user, learner, accessLevel)));
        return learner;
    }
}
