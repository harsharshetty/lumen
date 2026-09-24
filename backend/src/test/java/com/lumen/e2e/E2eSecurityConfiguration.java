package com.lumen.e2e;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.Learner;
import com.lumen.domain.LearnerAccessLevel;
import com.lumen.domain.User;
import com.lumen.domain.UserLearnerAccess;
import com.lumen.repository.LearnerRepository;
import com.lumen.repository.UserLearnerAccessRepository;
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
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Configuration
@Profile("e2e")
public class E2eSecurityConfiguration {

    @Bean
    @Order(0)
    SecurityFilterChain e2eApiSecurityFilterChain(HttpSecurity http,
                                                   E2eHeaderAuthenticationFilter authenticationFilter,
                                                   E2eAccessFixtureFilter accessFixtureFilter) throws Exception {
        return http
                .securityMatcher("/api/**")
                .authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .addFilterAfter(new E2eCsrfCookieFilter(), CsrfFilter.class)
                .addFilterBefore(authenticationFilter, AuthorizationFilter.class)
                .addFilterAfter(accessFixtureFilter, E2eHeaderAuthenticationFilter.class)
                .build();
    }

    @Bean
    E2eHeaderAuthenticationFilter e2eHeaderAuthenticationFilter(AuthenticatedUserService authenticatedUserService) {
        return new E2eHeaderAuthenticationFilter(authenticatedUserService);
    }

    @Bean
    E2eAccessFixtureFilter e2eAccessFixtureFilter(AuthenticatedUserService authenticatedUserService,
                                                  LearnerRepository learnerRepository,
                                                  UserLearnerAccessRepository accessRepository) {
        return new E2eAccessFixtureFilter(authenticatedUserService, learnerRepository, accessRepository);
    }

    static final class E2eCsrfCookieFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
            csrfToken.getToken();
            filterChain.doFilter(request, response);
        }
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
                String providerHeader = request.getHeader("X-E2E-Provider");
                IdentityProvider provider = providerHeader == null || providerHeader.isBlank()
                        ? IdentityProvider.GOOGLE
                        : IdentityProvider.valueOf(providerHeader.toUpperCase(Locale.ROOT));
                String registrationId = provider.name().toLowerCase(Locale.ROOT);
                String email = request.getHeader("X-E2E-Email");
                if (email == null || email.isBlank()) {
                    email = subject + "@e2e.invalid";
                }

                synchronized (authenticatedUserService) {
                    authenticatedUserService.resolveOrProvision(provider, subject, displayName);
                }

                Instant issuedAt = Instant.now();
                OidcIdToken idToken = new OidcIdToken(
                        "e2e-" + registrationId + "-" + subject,
                        issuedAt,
                        issuedAt.plusSeconds(3600),
                        Map.of("sub", subject, "name", displayName, "email", email));
                OidcUser principal = new DefaultOidcUser(
                        List.of(new SimpleGrantedAuthority("ROLE_USER")),
                        idToken);
                OAuth2AuthenticationToken authentication = new OAuth2AuthenticationToken(
                        principal,
                        principal.getAuthorities(),
                        registrationId);
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }

            filterChain.doFilter(request, response);
        }
    }

    static final class E2eAccessFixtureFilter extends OncePerRequestFilter {
        private final AuthenticatedUserService authenticatedUserService;
        private final LearnerRepository learnerRepository;
        private final UserLearnerAccessRepository accessRepository;

        private E2eAccessFixtureFilter(AuthenticatedUserService authenticatedUserService,
                                       LearnerRepository learnerRepository,
                                       UserLearnerAccessRepository accessRepository) {
            this.authenticatedUserService = authenticatedUserService;
            this.learnerRepository = learnerRepository;
            this.accessRepository = accessRepository;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {
            String learnerId = request.getHeader("X-E2E-Learner-Id");
            String accessLevel = request.getHeader("X-E2E-Access-Level");
            if (learnerId != null && accessLevel != null
                    && SecurityContextHolder.getContext().getAuthentication() instanceof OAuth2AuthenticationToken authentication) {
                User user = authenticatedUserService.currentUser(authentication);
                Learner learner = learnerRepository.findById(UUID.fromString(learnerId)).orElseThrow();
                synchronized (accessRepository) {
                    accessRepository.findByUserAndLearner(user, learner)
                            .ifPresentOrElse(
                                    access -> access.changeAccessLevel(LearnerAccessLevel.valueOf(accessLevel)),
                                    () -> accessRepository.save(new UserLearnerAccess(user, learner, LearnerAccessLevel.valueOf(accessLevel))));
                }
            }
            filterChain.doFilter(request, response);
        }
    }
}
