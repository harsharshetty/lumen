package com.lumen.controller;

import com.lumen.domain.Learner;
import com.lumen.dto.CreateLearnerRequest;
import com.lumen.dto.LearnerResponse;
import com.lumen.service.LearnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final LearnerService learnerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LearnerResponse createLearner(@RequestBody CreateLearnerRequest request) {
        return toResponse(learnerService.createLearner(request.displayName()));
    }

    @GetMapping("/{id}")
    public LearnerResponse getLearner(@PathVariable UUID id) {
        return toResponse(learnerService.getLearner(id));
    }

    @GetMapping
    public List<LearnerResponse> listLearners() {
        return learnerService.listLearners().stream()
                .map(LearnerController::toResponse)
                .toList();
    }

    private static LearnerResponse toResponse(Learner learner) {
        return new LearnerResponse(learner.getId(), learner.getDisplayName());
    }
}
