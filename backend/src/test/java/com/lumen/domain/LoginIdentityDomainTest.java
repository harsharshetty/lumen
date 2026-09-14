package com.lumen.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginIdentityDomainTest {

    @Test
    void loginIdentityKeepsProviderNeutralIdentityKeyAndUser() {
        User user = new User("Harsha", UserRole.USER);
        LoginIdentity identity = new LoginIdentity(user, IdentityProvider.GOOGLE, "google-subject-123");

        assertThat(identity.getId()).isNull();
        assertThat(identity.getUser()).isSameAs(user);
        assertThat(identity.getProvider()).isEqualTo(IdentityProvider.GOOGLE);
        assertThat(identity.getProviderSubject()).isEqualTo("google-subject-123");
        assertThat(identity.getVerifiedEmail()).isNull();
        assertThat(IdentityProvider.values())
                .containsExactly(IdentityProvider.GOOGLE, IdentityProvider.APPLE, IdentityProvider.MICROSOFT, IdentityProvider.GITHUB);
    }

    @Test
    void loginIdentityRequiresUserProviderAndProviderSubject() {
        User user = new User("Harsha", UserRole.USER);

        assertThatThrownBy(() -> new LoginIdentity(null, IdentityProvider.GOOGLE, "subject"))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new LoginIdentity(user, null, "subject"))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new LoginIdentity(user, IdentityProvider.GOOGLE, null))
                .isInstanceOf(NullPointerException.class);
    }
}
