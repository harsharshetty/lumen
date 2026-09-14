package com.lumen.service.impl;
import com.lumen.domain.Learner;
import com.lumen.repository.LearnerRepository;
import com.lumen.service.LearnerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
@Service
@Transactional(readOnly = true)
public class LearnerServiceImpl implements LearnerService {
    private final LearnerRepository repository;
    public LearnerServiceImpl(LearnerRepository repository) { this.repository = repository; }
    @Override @Transactional public Learner create(String displayName) { return repository.save(new Learner(displayName)); }
    @Override public Learner get(UUID id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Learner not found: " + id)); }
    @Override public List<Learner> list() { return repository.findAll(); }
}
