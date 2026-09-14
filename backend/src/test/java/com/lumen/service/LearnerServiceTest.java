package com.lumen.service;

import com.lumen.domain.Learner;
import com.lumen.repository.LearnerRepository;
import com.lumen.service.impl.LearnerServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LearnerServiceTest {

    @Test
    void learnerServiceCoversCreateGetListAndMissingLearner() {
        LearnerRepository repository = mock(LearnerRepository.class);
        LearnerService service = new LearnerServiceImpl(repository);
        Learner saved = new Learner("Aarohi");
        UUID id = UUID.randomUUID();

        when(repository.save(any(Learner.class))).thenReturn(saved);
        when(repository.findById(id)).thenReturn(Optional.of(saved));
        when(repository.findAll()).thenReturn(List.of(saved));

        assertThat(service.createLearner("Aarohi")).isSameAs(saved);
        assertThat(service.getLearner(id)).isSameAs(saved);
        assertThat(service.listLearners()).containsExactly(saved);
        verify(repository).save(any(Learner.class));

        UUID missingId = UUID.randomUUID();
        when(repository.findById(missingId)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getLearner(missingId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Learner not found: " + missingId);
    }
}
