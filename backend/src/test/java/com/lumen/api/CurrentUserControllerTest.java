package com.lumen.api;

import com.lumen.domain.User;
import com.lumen.domain.UserRole;
import com.lumen.security.AuthenticatedUserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CurrentUserControllerTest {
    @Test
    void returnsTheProvisionedAuthenticatedUsersDisplayName() {
        AuthenticatedUserService authenticatedUserService = mock(AuthenticatedUserService.class);
        OAuth2AuthenticationToken authentication = mock(OAuth2AuthenticationToken.class);
        when(authenticatedUserService.currentUser(authentication)).thenReturn(new User("Harsha", UserRole.USER));

        CurrentUserController.CurrentUserResponse response =
                new CurrentUserController(authenticatedUserService).currentUser(authentication);

        assertThat(response.displayName()).isEqualTo("Harsha");
    }
}
