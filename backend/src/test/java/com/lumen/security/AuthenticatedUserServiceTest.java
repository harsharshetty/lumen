package com.lumen.security;

import com.lumen.domain.IdentityProvider;
import com.lumen.domain.LoginIdentity;
import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.repository.LoginIdentityRepository;
import com.lumen.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
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
}
