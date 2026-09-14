package com.lumen.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LearnerApiExposureIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void learnerListEndpointIsUnavailableUntilAuthorizationExists() throws Exception {
        mockMvc.perform(get("/api/learners"))
                .andExpect(status().isNotFound());
    }

    @Test
    void learnerReadEndpointIsUnavailableUntilAuthorizationExists() throws Exception {
        mockMvc.perform(get("/api/learners/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound());
    }

    @Test
    void learnerCreateEndpointIsUnavailableUntilAuthorizationExists() throws Exception {
        mockMvc.perform(post("/api/learners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Aarohi\"}"))
                .andExpect(status().isNotFound());
    }
}
