package com.lumen.controller;

import com.lumen.domain.Learner;
import com.lumen.dto.CreateLearnerRequest;
import com.lumen.dto.LearnerResponse;
import com.lumen.service.LearnerService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LearnerControllerTest {

    @Test
    void learnerControllerCoversCreateGetAndList() {
        LearnerService service = mock(LearnerService.class);
        LearnerController controller = new LearnerController(service);
        Learner learner = new Learner("Aarohi");
        UUID id = UUID.randomUUID();

        when(service.createLearner("Aarohi")).thenReturn(learner);
        LearnerResponse created = controller.createLearner(new CreateLearnerRequest("Aarohi"));
        assertThat(created.id()).isNull();
        assertThat(created.displayName()).isEqualTo("Aarohi");
        verify(service).createLearner("Aarohi");

        when(service.getLearner(id)).thenReturn(learner);
        LearnerResponse fetched = controller.getLearner(id);
        assertThat(fetched.id()).isNull();
        assertThat(fetched.displayName()).isEqualTo("Aarohi");
        verify(service).getLearner(id);

        when(service.listLearners()).thenReturn(List.of(learner));
        assertThat(controller.listLearners())
                .extracting(LearnerResponse::displayName)
                .containsExactly("Aarohi");
        verify(service).listLearners();
    }
}
