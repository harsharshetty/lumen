package com.lumen.api;

import com.lumen.service.LearnerCurriculumSelectionService;
import com.lumen.service.LearnerOnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.DeleteMapping;
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
    private final LearnerCurriculumSelectionService learnerCurriculumSelectionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    LearnerResponse create(OAuth2AuthenticationToken authentication, @Valid @RequestBody LearnerCreateRequest request) {
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

    @GetMapping("/{learnerId}/curricula")
    List<CurriculumResponse> listCurricula(OAuth2AuthenticationToken authentication, @PathVariable UUID learnerId) {
        return learnerCurriculumSelectionService.list(authentication, learnerId).stream()
                .map(CurriculumResponse::from)
                .toList();
    }

    @PostMapping("/{learnerId}/curricula/{curriculumId}")
    CurriculumResponse addCurriculum(OAuth2AuthenticationToken authentication,
                                     @PathVariable UUID learnerId,
                                     @PathVariable UUID curriculumId) {
        return CurriculumResponse.from(learnerCurriculumSelectionService.add(authentication, learnerId, curriculumId));
    }

    @DeleteMapping("/{learnerId}/curricula/{curriculumId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void removeCurriculum(OAuth2AuthenticationToken authentication,
                          @PathVariable UUID learnerId,
                          @PathVariable UUID curriculumId) {
        learnerCurriculumSelectionService.remove(authentication, learnerId, curriculumId);
    }
}
