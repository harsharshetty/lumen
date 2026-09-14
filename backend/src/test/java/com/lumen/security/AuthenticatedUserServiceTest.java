package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthenticatedUserServiceTest {

    @Test
    void resolvesExistingIdentityWithoutProvisioningAnotherUser() {
        LoginIdentityRepository identities = mock(LoginIdentityRepository.class);
        UserRepository users = mock(UserRepository.class);
        AuthenticatedUserService service = new AuthenticatedUserService(identities, users);
        User existing = new User("Existing", UserRole.USER);
        LoginIdentity identity = new LoginIdentity(existing, IdentityProvider.GOOGLE, "subject-1");
        when(identities.findByProviderAndProviderSubject(IdentityProvider.GOOGLE, "subject-1"))
                .thenReturn(Optional.of(identity));

        User resolved = service.resolveOrProvision(IdentityProvider.GOOGLE, "subject-1", "Changed Name");

        assertThat(resolved).isSameAs(existing);
        verify(users, never()).save(any());
        verify(identities, never()).save(any());
    }

    @Test
    void provisionsNewUserForPreviouslyUnseenProviderSubject() {
        LoginIdentityRepository identities = mock(LoginIdentityRepository.class);
        UserRepository users = mock(UserRepository.class);
        AuthenticatedUserService service = new AuthenticatedUserService(identities, users);
        when(identities.findByProviderAndProviderSubject(IdentityProvider.MICROSOFT, "subject-2"))
                .thenReturn(Optional.empty());
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User resolved = service.resolveOrProvision(IdentityProvider.MICROSOFT, "subject-2", "New User");

        assertThat(resolved.getDisplayName()).isEqualTo("New User");
        assertThat(resolved.getPlatformRole()).isEqualTo(UserRole.USER);
        verify(users).save(any(User.class));
        verify(identities).save(any(LoginIdentity.class));
    }

    @Test
    void resolvesCurrentPersistedUserFromOidcAuthentication() {
        LoginIdentityRepository identities = mock(LoginIdentityRepository.class);
        AuthenticatedUserService service = new AuthenticatedUserService(identities, mock(UserRepository.class));
        User existing = new User("Existing", UserRole.USER);
        when(identities.findByProviderAndProviderSubject(IdentityProvider.GOOGLE, "subject-3"))
                .thenReturn(Optional.of(new LoginIdentity(existing, IdentityProvider.GOOGLE, "subject-3")));
        OAuth2AuthenticationToken authentication = authentication("google", "subject-3");

        User resolved = service.currentUser(authentication);

        assertThat(resolved).isSameAs(existing);
    }

    @Test
    void rejectsAuthenticatedIdentityThatWasNotProvisioned() {
        LoginIdentityRepository identities = mock(LoginIdentityRepository.class);
        AuthenticatedUserService service = new AuthenticatedUserService(identities, mock(UserRepository.class));
        when(identities.findByProviderAndProviderSubject(IdentityProvider.GITHUB, "missing"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.currentUser(authentication("github", "missing")))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class)
                .hasMessage("Authenticated identity is not provisioned");
    }

    private OAuth2AuthenticationToken authentication(String provider, String subject) {
        OidcUser oidcUser = mock(OidcUser.class);
        when(oidcUser.getSubject()).thenReturn(subject);
        return new OAuth2AuthenticationToken(oidcUser, List.of(), provider);
    }
}
