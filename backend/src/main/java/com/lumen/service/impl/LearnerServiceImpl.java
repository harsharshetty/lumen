package com.lumen.service.impl;

import com.lumen.domain.Learner;
import com.lumen.repository.LearnerRepository;
import com.lumen.service.LearnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearnerServiceImpl implements LearnerService {
    private final LearnerRepository learnerRepository;

    @Override
    public Learner createLearner(String displayName) {
        return learnerRepository.save(new Learner(displayName));
    }

    @Override
    public Learner getLearner(UUID id) {
        return learnerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learner not found: " + id));
    }

    @Override
    public List<Learner> listLearners() {
        return learnerRepository.findAll();
    }
}
