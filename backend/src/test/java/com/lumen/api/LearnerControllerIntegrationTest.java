package com.lumen.api;

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

    @BeforeEach
    void cleanDatabase() {
        accessRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        learnerRepository.deleteAll();
        userRepository.deleteAll();
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
