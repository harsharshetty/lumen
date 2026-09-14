package com.lumen.api;

import com.lumen.domain.Curriculum;
import com.lumen.domain.IdentityProvider;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.Subject;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import com.lumen.domain.UserRole;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearnerCurriculumRepository;
import com.lumen.repository.LearnerRepository;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.SubjectRepository;
import com.lumen.repository.UserLearnerAccessRepository;
import com.lumen.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LearnerControllerIntegrationTest {
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
    @Autowired
    private LearnerCurriculumRepository learnerCurriculumRepository;
    @Autowired
    private CurriculumRepository curriculumRepository;
    @Autowired
    private SubjectRepository subjectRepository;

    @BeforeEach
    void cleanDatabase() {
        learnerCurriculumRepository.deleteAll();
        accessRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        learnerRepository.deleteAll();
        userRepository.deleteAll();
        curriculumRepository.deleteAll();
        subjectRepository.deleteAll();
    }

    @Test
    void authenticatedUserCreatesOwnLearnerThenListsAndReadsIt() throws Exception {
        provisionUser("parent-subject", "Parent");

        String response = mockMvc.perform(post("/api/learners")
                        .with(authenticatedAs("parent-subject"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Ava\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.displayName").value("Ava"))
                .andReturn().getResponse().getContentAsString();

        Learner learner = learnerRepository.findAll().getFirst();
        assertThat(response).contains(learner.getId().toString());
        assertThat(accessRepository.findAll()).singleElement()
                .satisfies(access -> {
                    assertThat(access.getLearner().getId()).isEqualTo(learner.getId());
                    assertThat(access.getAccessLevel()).isEqualTo(LearnerAccessLevel.OWNER);
                });

        mockMvc.perform(get("/api/learners").with(authenticatedAs("parent-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(learner.getId().toString()))
                .andExpect(jsonPath("$[0].displayName").value("Ava"));

        mockMvc.perform(get("/api/learners/{id}", learner.getId()).with(authenticatedAs("parent-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(learner.getId().toString()))
                .andExpect(jsonPath("$.displayName").value("Ava"));
    }

    @Test
    void unauthenticatedAndUnrelatedUsersCannotAccessLearnerData() throws Exception {
        User owner = provisionUser("owner-subject", "Owner");
        provisionUser("other-subject", "Other");
        Learner learner = learnerRepository.save(new Learner("Private"));
        accessRepository.save(new UserLearnerAccess(owner, learner, LearnerAccessLevel.OWNER));

        mockMvc.perform(get("/api/learners"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/api/learners").with(authenticatedAs("other-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/learners/{id}", learner.getId()).with(authenticatedAs("other-subject")))
                .andExpect(status().isForbidden());
    }

    @Test
    void learnerCurriculumSelectionHonorsAccessLevelsAndActiveCatalog() throws Exception {
        User owner = provisionUser("owner-subject", "Owner");
        User contributor = provisionUser("contributor-subject", "Contributor");
        User viewer = provisionUser("viewer-subject", "Viewer");
        provisionUser("other-subject", "Other");
        Learner learner = learnerRepository.save(new Learner("Ava"));
        accessRepository.save(new UserLearnerAccess(owner, learner, LearnerAccessLevel.OWNER));
        accessRepository.save(new UserLearnerAccess(contributor, learner, LearnerAccessLevel.CONTRIBUTOR));
        accessRepository.save(new UserLearnerAccess(viewer, learner, LearnerAccessLevel.VIEWER));

        Subject mathematics = subjectRepository.save(new Subject("Mathematics"));
        Curriculum active = curriculumRepository.save(new Curriculum("CBSE Grade 3 Mathematics", "3", mathematics));
        active.setActive(true);
        active = curriculumRepository.save(active);
        Curriculum inactive = curriculumRepository.save(new Curriculum("Retired Grade 3 Mathematics", "3", mathematics));

        mockMvc.perform(post("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), active.getId())
                        .with(authenticatedAs("contributor-subject"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(active.getId().toString()));

        mockMvc.perform(post("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), active.getId())
                        .with(authenticatedAs("owner-subject"))
                        .with(csrf()))
                .andExpect(status().isOk());
        assertThat(learnerCurriculumRepository.findByLearnerId(learner.getId())).hasSize(1);

        mockMvc.perform(get("/api/learners/{learnerId}/curricula", learner.getId())
                        .with(authenticatedAs("viewer-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(active.getId().toString()));

        mockMvc.perform(post("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), inactive.getId())
                        .with(authenticatedAs("owner-subject"))
                        .with(csrf()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), active.getId())
                        .with(authenticatedAs("viewer-subject"))
                        .with(csrf()))
                .andExpect(status().isForbidden());
        assertThat(learnerCurriculumRepository.findByLearnerId(learner.getId())).hasSize(1);

        mockMvc.perform(get("/api/learners/{learnerId}/curricula", learner.getId())
                        .with(authenticatedAs("other-subject")))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), active.getId())
                        .with(authenticatedAs("contributor-subject"))
                        .with(csrf()))
                .andExpect(status().isNoContent());
        assertThat(learnerCurriculumRepository.findByLearnerId(learner.getId())).isEmpty();

        mockMvc.perform(delete("/api/learners/{learnerId}/curricula/{curriculumId}", learner.getId(), active.getId())
                        .with(authenticatedAs("owner-subject"))
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    private User provisionUser(String subject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, IdentityProvider.GOOGLE, subject));
        return user;
    }

    private RequestPostProcessor authenticatedAs(String subject) {
        OidcUser principal = mock(OidcUser.class);
        when(principal.getSubject()).thenReturn(subject);
        return authentication(new OAuth2AuthenticationToken(principal, List.of(), "google"));
    }
}
