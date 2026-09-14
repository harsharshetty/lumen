package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {
    private final LoginIdentityRepository loginIdentityRepository;
    private final UserRepository userRepository;

    @Transactional
    public User resolveOrProvision(IdentityProvider provider, String providerSubject, String displayName) {
        return loginIdentityRepository.findByProviderAndProviderSubject(provider, providerSubject)
                .map(LoginIdentity::getUser)
                .orElseGet(() -> provision(provider, providerSubject, displayName));
    }

    public User currentUser(OAuth2AuthenticationToken authentication) {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        IdentityProvider provider = OAuth2LoginSuccessHandler.toProvider(authentication.getAuthorizedClientRegistrationId());
        return loginIdentityRepository.findByProviderAndProviderSubject(provider, oidcUser.getSubject())
                .map(LoginIdentity::getUser)
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Authenticated identity is not provisioned"));
    }

    private User provision(IdentityProvider provider, String providerSubject, String displayName) {
        User user = userRepository.save(new User(displayName, UserRole.USER));
        loginIdentityRepository.save(new LoginIdentity(user, provider, providerSubject));
        return user;
    }
}
