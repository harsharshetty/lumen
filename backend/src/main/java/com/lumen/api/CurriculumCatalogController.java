package com.lumen.api;

import com.lumen.service.CurriculumCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CurriculumCatalogController {
    private final CurriculumCatalogService curriculumCatalogService;

    @GetMapping("/api/curricula")
    List<CurriculumResponse> listActive() {
        return curriculumCatalogService.listActive().stream().map(CurriculumResponse::from).toList();
    }

    @PostMapping("/api/admin/curricula")
    @ResponseStatus(HttpStatus.CREATED)
    CurriculumResponse create(OAuth2AuthenticationToken authentication, @RequestBody CurriculumUpsertRequest request) {
        return CurriculumResponse.from(curriculumCatalogService.create(
                authentication, request.name(), request.gradeLevel(), request.subjectId()));
    }

    @PutMapping("/api/admin/curricula/{curriculumId}")
    CurriculumResponse update(OAuth2AuthenticationToken authentication,
                              @PathVariable UUID curriculumId,
                              @RequestBody CurriculumUpsertRequest request) {
        return CurriculumResponse.from(curriculumCatalogService.update(
                authentication, curriculumId, request.name(), request.gradeLevel(), request.subjectId()));
    }

    @PostMapping("/api/admin/curricula/{curriculumId}/activate")
    CurriculumResponse activate(OAuth2AuthenticationToken authentication, @PathVariable UUID curriculumId) {
        return CurriculumResponse.from(curriculumCatalogService.setActive(authentication, curriculumId, true));
    }

    @PostMapping("/api/admin/curricula/{curriculumId}/deactivate")
    CurriculumResponse deactivate(OAuth2AuthenticationToken authentication, @PathVariable UUID curriculumId) {
        return CurriculumResponse.from(curriculumCatalogService.setActive(authentication, curriculumId, false));
    }
}
