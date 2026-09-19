package com.lumen.api;

import com.lumen.security.AuthenticatedUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class CurrentUserController {
    private final AuthenticatedUserService authenticatedUserService;

    @GetMapping
    public CurrentUserResponse currentUser(OAuth2AuthenticationToken authentication) {
        return new CurrentUserResponse(authenticatedUserService.currentUser(authentication).getDisplayName());
    }

    public record CurrentUserResponse(String displayName) {}
}
