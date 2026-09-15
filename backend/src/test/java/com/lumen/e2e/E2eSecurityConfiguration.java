package com.lumen.e2e;

import com.lumen.domain.IdentityProvider;
import com.lumen.security.AuthenticatedUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Configuration
@Profile("e2e")
public class E2eSecurityConfiguration {

    @Bean
    @Order(0)
    SecurityFilterChain e2eApiSecurityFilterChain(HttpSecurity http,
                                                   E2eHeaderAuthenticationFilter authenticationFilter) throws Exception {
        return http
                .securityMatcher("/api/**")
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
                .addFilterBefore(authenticationFilter, AuthorizationFilter.class)
                .build();
    }

    @Bean
    E2eHeaderAuthenticationFilter e2eHeaderAuthenticationFilter(AuthenticatedUserService authenticatedUserService) {
        return new E2eHeaderAuthenticationFilter(authenticatedUserService);
    }

    static final class E2eHeaderAuthenticationFilter extends OncePerRequestFilter {
        private final AuthenticatedUserService authenticatedUserService;

        private E2eHeaderAuthenticationFilter(AuthenticatedUserService authenticatedUserService) {
            this.authenticatedUserService = authenticatedUserService;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            String subject = request.getHeader("X-E2E-Subject");
            if (subject != null && !subject.isBlank()) {
                String displayName = request.getHeader("X-E2E-Name");
                if (displayName == null || displayName.isBlank()) {
                    displayName = subject;
                }

                synchronized (authenticatedUserService) {
                    authenticatedUserService.resolveOrProvision(IdentityProvider.GOOGLE, subject, displayName);
                }

                Instant issuedAt = Instant.now();
                OidcIdToken idToken = new OidcIdToken(
                        "e2e-" + subject,
                        issuedAt,
                        issuedAt.plusSeconds(3600),
                        Map.of("sub", subject, "name", displayName));
                OidcUser principal = new DefaultOidcUser(
                        List.of(new SimpleGrantedAuthority("ROLE_USER")),
                        idToken);
                OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                        principal,
                        principal.getAuthorities(),
                        "google");
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }

            filterChain.doFilter(request, response);
        }
    }
}
