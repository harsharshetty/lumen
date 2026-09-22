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
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminLearnerIsolationIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private LoginIdentityRepository loginIdentityRepository;
    @Autowired private LearnerRepository learnerRepository;
    @Autowired private UserLearnerAccessRepository accessRepository;

    @BeforeEach
    void cleanDatabase() {
        accessRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        learnerRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void adminRoleAloneDoesNotGrantUnrelatedLearnerAccessOrEnumeration() throws Exception {
        User owner = provisionUser("owner-subject", "Owner", UserRole.USER);
        provisionUser("admin-subject", "Admin", UserRole.ADMIN);
        Learner learner = learnerRepository.save(new Learner("Private learner"));
        accessRepository.save(new UserLearnerAccess(owner, learner, LearnerAccessLevel.OWNER));

        mockMvc.perform(get("/api/learners").with(authenticatedAs("admin-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/learners/{id}", learner.getId()).with(authenticatedAs("admin-subject")))
                .andExpect(status().isForbidden());
    }

    private User provisionUser(String subject, String displayName, UserRole role) {
        User user = userRepository.save(new User(displayName, role));
        loginIdentityRepository.save(new LoginIdentity(user, IdentityProvider.GOOGLE, subject));
        return user;
    }

    private RequestPostProcessor authenticatedAs(String subject) {
        OidcUser principal = mock(OidcUser.class);
        when(principal.getSubject()).thenReturn(subject);
        return authentication(new OAuth2AuthenticationToken(principal, List.of(), "google"));
    }
}
