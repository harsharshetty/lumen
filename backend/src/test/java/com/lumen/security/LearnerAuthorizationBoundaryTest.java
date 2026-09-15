package com.lumen.security;

import com.lumen.LumenApplication;
import com.lumen.domain.IdentityProvider;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import com.lumen.domain.UserRole;
import com.lumen.repository.LearnerRepository;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserLearnerAccessRepository;
import com.lumen.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {LumenApplication.class, LearnerAuthorizationBoundaryTest.TestApi.class})
@AutoConfigureMockMvc
class LearnerAuthorizationBoundaryTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LoginIdentityRepository loginIdentityRepository;
    @Autowired
    private LearnerRepository learnerRepository;
    @Autowired
    private UserLearnerAccessRepository accessRepository;

    @BeforeEach
    void cleanDatabase() {
        accessRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        learnerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void unauthenticatedCallerCannotCrossApiBoundary() throws Exception {
        mockMvc.perform(get("/api/authz-test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listIsScopedToAuthenticatedUsersAccessRecords() throws Exception {
        User owner = provisionUser("owner-subject", "Owner");
        User other = provisionUser("other-subject", "Other");
        Learner ownedLearner = learnerRepository.save(new Learner("Owned"));
        Learner unrelatedLearner = learnerRepository.save(new Learner("Unrelated"));
        accessRepository.save(new UserLearnerAccess(owner, ownedLearner, LearnerAccessLevel.OWNER));
        accessRepository.save(new UserLearnerAccess(other, unrelatedLearner, LearnerAccessLevel.OWNER));

        mockMvc.perform(get("/api/authz-test").with(authenticatedAs("owner-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0]").value(ownedLearner.getId().toString()));
    }

    @Test
    void ownerContributorAndViewerCanReadButNoAccessCannotDirectRead() throws Exception {
        Learner learner = learnerRepository.save(new Learner("Protected"));
        grant("owner-subject", learner, LearnerAccessLevel.OWNER);
        grant("contributor-subject", learner, LearnerAccessLevel.CONTRIBUTOR);
        grant("viewer-subject", learner, LearnerAccessLevel.VIEWER);
        provisionUser("no-access-subject", "No Access");

        mockMvc.perform(get("/api/authz-test/{id}", learner.getId()).with(authenticatedAs("owner-subject")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/authz-test/{id}", learner.getId()).with(authenticatedAs("contributor-subject")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/authz-test/{id}", learner.getId()).with(authenticatedAs("viewer-subject")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/authz-test/{id}", learner.getId()).with(authenticatedAs("no-access-subject")))
                .andExpect(status().isForbidden());
    }

    @Test
    void contributorAndOwnerCanMutateWhileViewerAndNoAccessLeaveStateUnchanged() throws Exception {
        Learner viewerLearner = learnerRepository.save(new Learner("Viewer Original"));
        grant("viewer-subject", viewerLearner, LearnerAccessLevel.VIEWER);
        provisionUser("no-access-subject", "No Access");

        mockMvc.perform(post("/api/authz-test/{id}", viewerLearner.getId())
                        .with(authenticatedAs("viewer-subject"))
                        .with(csrf()))
                .andExpect(status().isForbidden());
        assertThat(learnerRepository.findById(viewerLearner.getId()).orElseThrow().getDisplayName())
                .isEqualTo("Viewer Original");

        mockMvc.perform(post("/api/authz-test/{id}", viewerLearner.getId())
                        .with(authenticatedAs("no-access-subject"))
                        .with(csrf()))
                .andExpect(status().isForbidden());
        assertThat(learnerRepository.findById(viewerLearner.getId()).orElseThrow().getDisplayName())
                .isEqualTo("Viewer Original");

        Learner contributorLearner = learnerRepository.save(new Learner("Contributor Original"));
        grant("contributor-subject", contributorLearner, LearnerAccessLevel.CONTRIBUTOR);
        mockMvc.perform(post("/api/authz-test/{id}", contributorLearner.getId())
                        .with(authenticatedAs("contributor-subject"))
                        .with(csrf()))
                .andExpect(status().isOk());
        assertThat(learnerRepository.findById(contributorLearner.getId()).orElseThrow().getDisplayName())
                .isEqualTo("Updated");

        Learner ownerLearner = learnerRepository.save(new Learner("Owner Original"));
        grant("owner-subject", ownerLearner, LearnerAccessLevel.OWNER);
        mockMvc.perform(post("/api/authz-test/{id}", ownerLearner.getId())
                        .with(authenticatedAs("owner-subject"))
                        .with(csrf()))
                .andExpect(status().isOk());
        assertThat(learnerRepository.findById(ownerLearner.getId()).orElseThrow().getDisplayName())
                .isEqualTo("Updated");
    }

    @Test
    void authenticatedCreatorBecomesOwnerFromRequestContext() throws Exception {
        provisionUser("creator-subject", "Creator");
        Learner learner = learnerRepository.save(new Learner("New Learner"));

        mockMvc.perform(post("/api/authz-test/{id}/assign-owner", learner.getId())
                        .with(authenticatedAs("creator-subject"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("OWNER"));

        assertThat(accessRepository.findAll()).singleElement()
                .extracting(UserLearnerAccess::getAccessLevel)
                .isEqualTo(LearnerAccessLevel.OWNER);
    }

    private User provisionUser(String subject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, IdentityProvider.GOOGLE, subject));
        return user;
    }

    private void grant(String subject, Learner learner, LearnerAccessLevel accessLevel) {
        User user = provisionUser(subject, subject);
        accessRepository.save(new UserLearnerAccess(user, learner, accessLevel));
    }

    private RequestPostProcessor authenticatedAs(String subject) {
        OidcUser principal = mock(OidcUser.class);
        when(principal.getSubject()).thenReturn(subject);
        return authentication(new OAuth2AuthenticationToken(principal, List.of(), "google"));
    }

    @RestController
    @RequestMapping("/api/authz-test")
    static class TestApi {
        private final LearnerAuthorizationService authorizationService;
        private final LearnerRepository learnerRepository;

        TestApi(LearnerAuthorizationService authorizationService, LearnerRepository learnerRepository) {
            this.authorizationService = authorizationService;
            this.learnerRepository = learnerRepository;
        }

        @GetMapping
        List<UUID> list(OAuth2AuthenticationToken authentication) {
            return authorizationService.listAccessibleLearners(authentication).stream()
                    .map(Learner::getId)
                    .toList();
        }

        @GetMapping("/{learnerId}")
        UUID read(OAuth2AuthenticationToken authentication, @PathVariable UUID learnerId) {
            authorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.VIEWER);
            return learnerId;
        }

        @PostMapping("/{learnerId}")
        void mutate(OAuth2AuthenticationToken authentication, @PathVariable UUID learnerId) {
            authorizationService.requireAccess(authentication, learnerId, LearnerAccessLevel.CONTRIBUTOR);
            Learner learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setDisplayName("Updated");
            learnerRepository.save(learner);
        }

        @PostMapping("/{learnerId}/assign-owner")
        String assignOwner(OAuth2AuthenticationToken authentication, @PathVariable UUID learnerId) {
            Learner learner = learnerRepository.findById(learnerId).orElseThrow();
            return authorizationService.assignOwnerToCreator(authentication, learner).getAccessLevel().name();
        }
    }
}
