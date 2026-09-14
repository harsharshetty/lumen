package com.lumen.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LearnerApiExposureIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void learnerListEndpointRequiresAuthenticationAndRemainsUnimplemented() throws Exception {
        mockMvc.perform(get("/api/learners"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/api/learners").with(oidcLogin()))
                .andExpect(status().isNotFound());
    }

    @Test
    void learnerReadEndpointRequiresAuthenticationAndRemainsUnimplemented() throws Exception {
        UUID learnerId = UUID.randomUUID();

        mockMvc.perform(get("/api/learners/{id}", learnerId))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/api/learners/{id}", learnerId).with(oidcLogin()))
                .andExpect(status().isNotFound());
    }

    @Test
    void learnerCreateEndpointKeepsCsrfProtectionAndRemainsUnimplemented() throws Exception {
        mockMvc.perform(post("/api/learners")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Aarohi\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/learners")
                        .with(oidcLogin())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Aarohi\"}"))
                .andExpect(status().isNotFound());
    }
}
