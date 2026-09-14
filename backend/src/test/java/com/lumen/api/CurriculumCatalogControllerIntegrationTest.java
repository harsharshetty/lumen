package com.lumen.api;

import com.lumen.domain.Curriculum;
import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.Subject;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.CurriculumConceptRepository;
import com.lumen.repository.CurriculumRepository;
import com.lumen.repository.LearnerCurriculumRepository;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.SubjectRepository;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CurriculumCatalogControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private CurriculumRepository curriculumRepository;
    @Autowired
    private CurriculumConceptRepository curriculumConceptRepository;
    @Autowired
    private LearnerCurriculumRepository learnerCurriculumRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private LoginIdentityRepository loginIdentityRepository;
    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        learnerCurriculumRepository.deleteAll();
        curriculumConceptRepository.deleteAll();
        curriculumRepository.deleteAll();
        subjectRepository.deleteAll();
        loginIdentityRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void authenticatedUserReadsOnlyActiveCatalogAndCannotMutateCanonicalCurricula() throws Exception {
        provisionUser("user-subject", "Parent", UserRole.USER);
        Subject mathematics = subjectRepository.save(new Subject("Mathematics"));
        Curriculum active = new Curriculum("CBSE Mathematics", "Grade 3", mathematics);
        active.setActive(true);
        curriculumRepository.save(active);
        curriculumRepository.save(new Curriculum("Inactive Mathematics", "Grade 3", mathematics));

        mockMvc.perform(get("/api/curricula").with(authenticatedAs("user-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("CBSE Mathematics"))
                .andExpect(jsonPath("$[0].active").value(true));

        mockMvc.perform(post("/api/admin/curricula")
                        .with(authenticatedAs("user-subject"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Forbidden", "Grade 4", mathematics.getId())))
                .andExpect(status().isForbidden());

        assertThat(curriculumRepository.findAll()).hasSize(2);
    }

    @Test
    void adminCreatesEditsActivatesAndDeactivatesCurriculumWithoutDeletingIt() throws Exception {
        provisionUser("admin-subject", "Admin", UserRole.ADMIN);
        Subject mathematics = subjectRepository.save(new Subject("Mathematics"));
        Subject science = subjectRepository.save(new Subject("Science"));

        mockMvc.perform(post("/api/admin/curricula")
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("CBSE Mathematics", "Grade 3", mathematics.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.active").value(false));

        Curriculum created = curriculumRepository.findAll().getFirst();

        mockMvc.perform(put("/api/admin/curricula/{id}", created.getId())
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("CBSE Science", "Grade 4", science.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("CBSE Science"))
                .andExpect(jsonPath("$.gradeLevel").value("Grade 4"))
                .andExpect(jsonPath("$.subjectId").value(science.getId().toString()));

        mockMvc.perform(post("/api/admin/curricula/{id}/activate", created.getId())
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));

        mockMvc.perform(get("/api/curricula").with(authenticatedAs("admin-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        mockMvc.perform(post("/api/admin/curricula/{id}/deactivate", created.getId())
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(get("/api/curricula").with(authenticatedAs("admin-subject")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        assertThat(curriculumRepository.findById(created.getId())).isPresent();
    }

    @Test
    void adminReceivesNotFoundForMissingSubjectOrCurriculum() throws Exception {
        provisionUser("admin-subject", "Admin", UserRole.ADMIN);
        UUID missing = UUID.randomUUID();

        mockMvc.perform(post("/api/admin/curricula")
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson("Missing subject", "Grade 3", missing)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/admin/curricula/{id}/activate", missing)
                        .with(authenticatedAs("admin-subject"))
                        .with(csrf()))
                .andExpect(status().isNotFound());
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

    private String requestJson(String name, String gradeLevel, UUID subjectId) {
        return "{\"name\":\"" + name + "\",\"gradeLevel\":\"" + gradeLevel
                + "\",\"subjectId\":\"" + subjectId + "\"}";
    }
}
