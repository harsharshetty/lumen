package com.lumen.service;
import com.lumen.domain.Learner;
import java.util.List;
import java.util.UUID;
public interface LearnerService {
    Learner create(String displayName);
    Learner get(UUID id);
    List<Learner> list();
}
