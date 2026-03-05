package com.ssg.iot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssg.iot.dto.agentic.AgenticTaskCancelResponse;
import com.ssg.iot.dto.agentic.AgenticTaskStatusResponse;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitRequest;
import com.ssg.iot.dto.agentic.AgenticTaskSubmitResponse;
import com.ssg.iot.service.agentic.AgenticGatewayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InternalAgenticControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setup() {
        AgenticGatewayService gatewayService = new StubGatewayService();
        InternalAgenticController controller = new InternalAgenticController(gatewayService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void submitTaskReturnsPayload() throws Exception {
        mockMvc.perform(post("/internal/agentic/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"objective":"build flow","taskType":"build"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId", is("task-123")))
                .andExpect(jsonPath("$.status", is("QUEUED")));
    }

    @Test
    void getTaskReturnsPayload() throws Exception {
        mockMvc.perform(get("/internal/agentic/tasks/task-123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId", is("task-123")))
                .andExpect(jsonPath("$.status", is("RUNNING")));
    }

    @Test
    void cancelTaskReturnsPayload() throws Exception {
        mockMvc.perform(post("/internal/agentic/tasks/task-123/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskId", is("task-123")))
                .andExpect(jsonPath("$.status", is("CANCELLING")));
    }

    private static class StubGatewayService extends AgenticGatewayService {
        StubGatewayService() {
            super(new ObjectMapper());
        }

        @Override
        public AgenticTaskSubmitResponse submitTask(AgenticTaskSubmitRequest request) {
            AgenticTaskSubmitResponse response = new AgenticTaskSubmitResponse();
            response.setTaskId("task-123");
            response.setStatus("QUEUED");
            response.setAcceptedAt("2026-03-05T00:00:00Z");
            return response;
        }

        @Override
        public AgenticTaskStatusResponse getTaskStatus(String taskId) {
            AgenticTaskStatusResponse response = new AgenticTaskStatusResponse();
            response.setTaskId(taskId);
            response.setStatus("RUNNING");
            return response;
        }

        @Override
        public AgenticTaskCancelResponse cancelTask(String taskId) {
            AgenticTaskCancelResponse response = new AgenticTaskCancelResponse();
            response.setTaskId(taskId);
            response.setStatus("CANCELLING");
            response.setMessage("Cancel requested");
            return response;
        }
    }
}
