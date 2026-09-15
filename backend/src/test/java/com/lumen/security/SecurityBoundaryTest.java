package com.lumen.security;

import com.lumen.LumenApplication;
import com.lumen.domain.IdentityProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {LumenApplication.class, SecurityBoundaryTest.TestApi.class})
@AutoConfigureMockMvc
class SecurityBoundaryTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void apiBoundaryReturnsUnauthorizedForUnauthenticatedAndBootstrapsCsrfForAuthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/test").with(oidcLogin()))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    void loginSuccessResolvesIdentityAndRedirectsUsingDisplayNameWhenAvailable() throws Exception {
        AuthenticatedUserService service = mock(AuthenticatedUserService.class);
        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(service);
        OidcUser user = mock(OidcUser.class);
        when(user.getSubject()).thenReturn("subject-1");
        when(user.getFullName()).thenReturn("Parent User");
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(user, List.of(), "google");
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(request, response, token);

        verify(service).resolveOrProvision(IdentityProvider.GOOGLE, "subject-1", "Parent User");
        verify(response).sendRedirect("/");
    }

    @Test
    void loginSuccessFallsBackToSubjectAndProviderMappingIsProviderNeutral() throws Exception {
        AuthenticatedUserService service = mock(AuthenticatedUserService.class);
        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(service);
        OidcUser user = mock(OidcUser.class);
        when(user.getSubject()).thenReturn("subject-2");
        when(user.getFullName()).thenReturn(null);
        OAuth2AuthenticationToken token = new OAuth2AuthenticationToken(user, List.of(), "microsoft");
        HttpServletResponse response = mock(HttpServletResponse.class);

        handler.onAuthenticationSuccess(mock(HttpServletRequest.class), response, token);

        verify(service).resolveOrProvision(IdentityProvider.MICROSOFT, "subject-2", "subject-2");
        assertThat(OAuth2LoginSuccessHandler.toProvider("github")).isEqualTo(IdentityProvider.GITHUB);
        assertThat(OAuth2LoginSuccessHandler.toProvider("apple")).isEqualTo(IdentityProvider.APPLE);
    }

    @RestController
    static class TestApi {
        @GetMapping("/api/test")
        String test() {
            return "ok";
        }
    }
}
