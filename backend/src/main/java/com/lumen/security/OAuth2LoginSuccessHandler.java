package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthenticatedUserService authenticatedUserService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        OidcUser oidcUser = (OidcUser) token.getPrincipal();
        authenticatedUserService.resolveOrProvision(
                toProvider(token.getAuthorizedClientRegistrationId()),
                oidcUser.getSubject(),
                oidcUser.getFullName() != null ? oidcUser.getFullName() : oidcUser.getSubject());
        response.sendRedirect("/");
    }

    static IdentityProvider toProvider(String registrationId) {
        return IdentityProvider.valueOf(registrationId.toUpperCase(Locale.ROOT));
    }
}
