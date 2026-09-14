package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LumenOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    private final LoginIdentityRepository loginIdentityRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService delegate =
            new org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService();

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = delegate.loadUser(userRequest);
        resolveOrProvision(
                toProvider(userRequest.getClientRegistration().getRegistrationId()),
                oidcUser.getSubject(),
                oidcUser.getFullName() != null ? oidcUser.getFullName() : oidcUser.getSubject());
        return new DefaultOidcUser(oidcUser.getAuthorities(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    User resolveOrProvision(IdentityProvider provider, String providerSubject, String displayName) {
        return loginIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject)
                .map(LoginIdentity::getUser)
                .orElseGet(() -> provision(provider, providerSubject, displayName));
    }

    private User provision(IdentityProvider provider, String providerSubject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, provider, providerSubject));
        return user;
    }

    private static IdentityProvider toProvider(String registrationId) {
        try {
            return IdentityProvider.valueOf(registrationId.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new OAuth2AuthenticationException("Unsupported identity provider: " + registrationId);
        }
    }
}
