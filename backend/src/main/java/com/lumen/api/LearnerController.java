package com.lumen.api;

import com.lumen.service.LearnerOnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learners")
@RequiredArgsConstructor
public class LearnerController {
    private final LearnerOnboardingService learnerOnboardingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    LearnerResponse create(OAuth2AuthenticationToken authentication, @RequestBody LearnerCreateRequest request) {
        return LearnerResponse.from(learnerOnboardingService.create(authentication, request.displayName()));
    }

    @GetMapping
    List<LearnerResponse> list(OAuth2AuthenticationToken authentication) {
        return learnerOnboardingService.list(authentication).stream()
                .map(LearnerResponse::from)
                .toList();
    }

    @GetMapping("/{learnerId}")
    LearnerResponse get(OAuth2AuthenticationToken authentication, @PathVariable UUID learnerId) {
        return LearnerResponse.from(learnerOnboardingService.get(authentication, learnerId));
    }
}
