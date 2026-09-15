package com.lumen.api;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.SubjectRepository;
import com.lumen.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import javax.sql.DataSource;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductionCatalogBootstrapIntegrationTest {
    private static final String MIGRATION = "db/migration/V5__bootstrap_initial_curriculum_catalog.sql";

    @Autowired private MockMvc mockMvc;
    @Autowired private DataSource dataSource;
    @Autowired private CurriculumRepository curriculumRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private LoginIdentityRepository loginIdentityRepository;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void resetAndApplyBootstrap() {
        curriculumRepository.deleteAll();
        subjectRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        userRepository.deleteAll();

        applyBootstrap();
        applyBootstrap();
    }

    @Test
    void bootstrapIsRedeploySafeAndActiveCatalogIsVisibleToNormalUser() throws Exception {
        assertThat(subjectRepository.findAll())
                .extracting("name")
                .containsExactlyInAnyOrder("Hindi", "Mathematics");

        assertThat(curriculumRepository.findAll())
                .extracting("name", "gradeLevel", "active")
                .containsExactlyInAnyOrder(
                        org.assertj.core.groups.Tuple.tuple("CBSE Grade 3 Hindi", "Grade 3", true),
                        org.assertj.core.groups.Tuple.tuple("CBSE Grade 3 Mathematics", "Grade 3", true),
                        org.assertj.core.groups.Tuple.tuple("Olympiad Mathematics", "Grade 3", true));

        provisionUser("bootstrap-user", "Parent");

        mockMvc.perform(get("/api/curricula").with(authenticatedAs("bootstrap-user")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[?(@.name == 'CBSE Grade 3 Hindi')].subjectName").value("Hindi"))
                .andExpect(jsonPath("$[?(@.name == 'CBSE Grade 3 Mathematics')].subjectName").value("Mathematics"))
                .andExpect(jsonPath("$[?(@.name == 'Olympiad Mathematics')].subjectName").value("Mathematics"));
    }

    private void applyBootstrap() {
        new ResourceDatabasePopulator(new ClassPathResource(MIGRATION)).execute(dataSource);
    }

    private void provisionUser(String subject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, IdentityProvider.GOOGLE, subject));
    }

    private RequestPostProcessor authenticatedAs(String subject) {
        OidcUser principal = mock(OidcUser.class);
        when(principal.getSubject()).thenReturn(subject);
        return authentication(new OAuth2AuthenticationToken(principal, List.of(), "google"));
    }
}
